const formatMessage = (level, message, details) => {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(details ? { details } : {}),
    });
};

const logger = {
    info(message, details) {
        console.log(formatMessage("INFO", message, details));
    },

    warn(message, details) {
        console.warn(formatMessage("WARN", message, details));
    },

    error(message, details) {
        console.error(formatMessage("ERROR", message, details));
    },
};

export default logger;