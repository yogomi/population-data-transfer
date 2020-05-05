// 番号はSyslogのログレベルの数値に合わせる
export const PRIORITY = {
  crit: { priority: 2, bunyan_level: 'fatal' },
  err: { priority: 3, bunyan_level: 'error' },
  warn: { priority: 4, bunyan_level: 'warn' },
  info: { priority: 6, bunyan_level: 'info' },
  debug: { priority: 7, bunyan_level: 'debug' },
};

function isGoodMessage(messageArray) {
  return !messageArray.some((message) => message === undefined);
}

/* eslint-disable no-console */

class Flexlog {
  constructor(logLevel) {
    const functionName = 'Flexlog.constructor';
    if (Object.values(PRIORITY).indexOf(logLevel) === -1) {
      console.error(functionName, ': logLevel is not known PRIORITY.');
      this.logLevel = PRIORITY.debug;
    } else {
      this.logLevel = logLevel;
    }
    this.is_noizy_mode = true;
  }

  setLogLevel(logLevel) {
    const functionName = 'Flexlog.setLogLevel';
    if (Object.values(PRIORITY).indexOf(logLevel) === -1) {
      console.error(functionName, ': logLevel is not known PRIORITY.');
      this.logLevel = PRIORITY.debug;
    } else {
      this.logLevel = logLevel;
    }
  }

  debug(...message) {
    if (this.logLevel.priority < PRIORITY.debug.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('Flexlog.debug:', 'Bad message.');
      return;
    }
    console.log('Debug:', message);
  }

  info(...message) {
    if (this.logLevel.priority < PRIORITY.info.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('Flexlog.info:', 'Bad message.');
      return;
    }
    console.log('Info:', message);
  }

  warn(...message) {
    if (this.logLevel.priority < PRIORITY.warn.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('Flexlog.warn:', 'Bad message.');
      return;
    }
    console.log('Warn:', message);
  }

  err(...message) {
    if (this.logLevel.priority < PRIORITY.err.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('Flexlog.err:', 'Bad message.');
      return;
    }
    console.error('Error:', message);
  }

  crit(...message) {
    if (this.logLevel.priority < PRIORITY.crit.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('Flexlog.crit:', 'Bad message.');
      return;
    }
    console.error('Crit:', message);
  }

  // コンソール出力に関する設定を調整する
  quiet() {
    this.is_noizy_mode = false;
  }

  // コンソール出力に関する設定を調整する
  noizy() {
    this.is_noizy_mode = true;
  }
}

/* eslint-enable no-console */

export const flexlog = {
  logger: new Flexlog(PRIORITY.debug),
};
