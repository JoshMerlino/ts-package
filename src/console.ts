/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";

const { log } = global.console;

export default {
	log: (message?: any, ...optionalParams: any[]) => log(chalk.gray("[ LOG ]"), ...[ message, ...optionalParams ]),
	info: (message?: any, ...optionalParams: any[]) => log(chalk.blue("[ INFO ]"), ...[ message, ...optionalParams ]),
	error: (message?: any, ...optionalParams: any[]) => log(chalk.red("[ ERROR ]"), ...[ message, ...optionalParams ]),
	warn: (message?: any, ...optionalParams: any[]) => log(chalk.yellow("[ WARN ]"), ...[ message, ...optionalParams ]),
	good: (message?: any, ...optionalParams: any[]) => log(chalk.green("[ GOOD ]"), ...[ message, ...optionalParams ])
};
