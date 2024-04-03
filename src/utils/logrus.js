import chalk from "chalk";
import { parse } from "logfmt/lib/logfmt_parser";

const LOG_LEVEL_COLOR_MAP = {
    trace: chalk.gray,
    debug: chalk,
    info: chalk.cyan,
    warning: chalk.yellow,
    error: chalk.red,
    fatal: chalk.red,
    panic: chalk.red,
};

const orderFieldsByKey = (fields) => {
    const ordered = {};

    Object.keys(fields)
            .sort()
            .forEach((key) => {
                ordered[key] = fields[key];
            });

    return ordered;
};

export const logMessage = (data) => {
    const { level, msg, ...rest } = parse(data);
    const color = LOG_LEVEL_COLOR_MAP[level];
    const orderedFields = orderFieldsByKey(rest);

    const header = color(level.substring(0, 4).toUpperCase());
    const message = msg.padEnd(45, ' ');

    const fields = Object.entries(orderedFields)
            .map(val => {
                const key = val[0];
                let value = val[1];

                if (value.length === 0) {
                    value = '""';
                }

                return `${color(key)}=${value}`;
            });

    return [header, message, ...fields].join(' ');
};
