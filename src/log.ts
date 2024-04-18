import chalk from "chalk"

function log(message: string) {
    const time = new Date().toLocaleTimeString();
    process.stdout.write(`[${chalk.dim(time)}] ${message}`);
}
export function tagLog(tag: string, message: string) {
    log(`<${chalk.bold(tag)}> ${message}\n`);
}

export function wssLog(message: string) {
    tagLog(chalk.blue("WSS"), message);
}

export function reqLog(message: string) {
    tagLog(chalk.green("Req"), message);
}

export function hotLog(message: string) {
    tagLog(chalk.red("Hot"), message);
}

