import chalk from "chalk";
import { readFile, rm, unlink, writeFile } from "fs/promises";
import fetch from "node-fetch";
import path from "path";
import { timeout } from "./util";
import console from "./console";
import mkdirp from "mkdirp";
import extract from "extract-zip";
import sharp from "sharp";
import { execSync } from "child_process";

export default async function resourcepacks(VERSIONS: string[]): Promise<void> {

	VERSIONS.map(async VERSION => {

		// Get api response
		const result: API.ResourcePacks = await fetch(`https://vanillatweaks.net/assets/resources/json/${VERSION}/rpcategories.json`)
			.then(res => res.json());

		// Map packs
		const packs = result.categories.map(category => category.packs.map(function(pack) {
			return {
				...pack,
				category: category.category.toLowerCase(),
				warning: category.warning
			};
		})).flat();

		// Count packs
		console.info(chalk.yellow("[RESOURCEPACKS]"), "Found", chalk.cyan(packs.length), "packs");

		// Create directory
		await mkdirp(path.resolve(`./build/${VERSION}/resourcepacks/`));

		// Download each sequentially
		async function generate(pack: ResourcePack){

			// Download file
			await generateLink(pack, VERSION)
				.then(link => download(link, pack, VERSION));

			// Extract zip file
			try {
				await rm(path.resolve(`./build/${VERSION}/resourcepacks/`, pack.name), { recursive: true });
			} catch {} finally {
				await extract(path.resolve(`./build/${VERSION}/resourcepacks/`, `${pack.name}.zip`), {
					dir: path.resolve(`./build/${VERSION}/resourcepacks/`, pack.name)
				});
			}

			// Remove zip file
			await unlink(path.resolve(`./build/${VERSION}/resourcepacks/`, `${pack.name}.zip`));

			// Save icon
			await fetch(`https://vanillatweaks.net/assets/resources/icons/resourcepacks/${VERSION}/${pack.name}.png`)
				.then(response => response.buffer())
				.then(buffer => sharp(buffer).toBuffer())
				.then(async buffer => {
					writeFile(path.resolve(`./build/${VERSION}/resourcepacks/`, pack.name, "icon.png"), buffer);
					return buffer;
				})
				.then(buffer => sharp(buffer)
					.extract({ left: 13, top: 13, width: 64, height: 64 })
					.toBuffer())
				.then(icon => writeFile(path.resolve(`./build/${VERSION}/resourcepacks/`, pack.name, "pack.png"), icon));

			// Get MCMeta
			const mcmeta: API.MCMeta = JSON.parse(await readFile(path.resolve(`./build/${VERSION}/resourcepacks/`, pack.name, "pack.mcmeta"), "utf8"));
			mcmeta.pack.description = `§a${pack.category.toUpperCase()[0] + pack.category.substring(1)}§7/§b${pack.name}\n §6Vanilla Tweaks 1.18 §evanillatweaks.net`;
			await writeFile(path.resolve(`./build/${VERSION}/resourcepacks/`, pack.name, "pack.mcmeta"), JSON.stringify(mcmeta, null, 4));

			// Rezip
			execSync(`zip -r ../${pack.name}.zip *`, { cwd: path.resolve(`./build/${VERSION}/resourcepacks/`, pack.name) });

		}

		// Generate packs
		(async function iterate(packs: ResourcePack[]) {
			const retry: ResourcePack[] = [];
			for (const pack of packs) await generate(pack).catch(e => {
				console.error(e);
				retry.push(pack);
			});
			iterate(retry);
		}(packs));
	});

}

// Iterate over resourcepacks
export async function generateLink(pack: ResourcePack, VERSION: string): Promise<string> {

	// Get pack name
	const packs = JSON.stringify(JSON.parse(`{"${pack.category}": ["${pack.name}"]}`));

	// Create url params
	const encodedParams = new URLSearchParams;
	encodedParams.set("version", VERSION!);
	encodedParams.set("packs", packs);

	// Get the pack link
	const download = await Promise.race([
		fetch("https://vanillatweaks.net/assets/server/zipresourcepacks.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: encodedParams
		}).then(resp => resp.json()) as Promise<API.ZipPacks>,
		timeout(5000)
	]);

	// Make sure no errors
	if (download.status !== "success") {
		console.error(chalk.yellow("[RESOURCEPACKS]"), "Lookup failed:", chalk.magenta(pack.name), JSON.stringify(download));
		throw new Error("Lookup failed");
	}

	const link = `https://vanillatweaks.net${download.link}`;
	return link;

}

export async function download(link: string, pack: ResourcePack, VERSION: string): Promise<void> {

	// Download the pack
	const binary = await fetch(link, {
		method: "GET",
		headers: {
			"Content-Type": "application/zip"
		}
	}).then(res => res.buffer());

	// Write the pack
	await writeFile(path.resolve(`./build/${VERSION}/resourcepacks/`, `${pack.name}.zip`), binary);
	console.info(chalk.yellow("[RESOURCEPACKS]"), "Downloaded:", chalk.cyan(pack.name), chalk.magenta(link));
}
