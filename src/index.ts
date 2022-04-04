/* eslint-disable no-empty */
// Configure variables in environment file (.env)
import dotenv from "dotenv";
import resourcepacks from "./resourcepacks";
dotenv.config();

const VERSIONS = [ "1.18", "1.17", "1.16", "1.15", "1.14" ];

(async function run(){
	// *********************
	// *** RESOURCEPACKS ***
	// *********************
	await resourcepacks(VERSIONS);
}());
