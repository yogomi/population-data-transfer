import bunyan from 'bunyan';
import bsyslog from 'bunyan-syslog';
import RotateFileStream from 'bunyan-rotating-file-stream';
import path from 'path';

import { Directory } from 'common_libs/file_utility';

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

class Flexlog {
  constructor(logLevel) {
    const functionName = 'Flexlog.constructor';
    if (Object.values(PRIORITY).indexOf(logLevel) === -1) {
      // eslint-disable-next-line no-console
      console.error(functionName, ': logLevel is not known PRIORITY.');
      this.logLevel = PRIORITY.debug;
    } else {
      this.logLevel = logLevel;
    }
    this.outputToFile = false;
    this.logFileSetting = {
      rotate: {
        period: '3d',
        count: 10,
        threshold_size: '200m',
        max_total_size: '1g',
      },
    };
    this.outputToSyslog = false;
    this.is_noizy_mode = true;
  }

  startBunyanLogger() {
    const streams = [];

    // NoizyモードのOn/Off
    if (this.is_noizy_mode) {
      streams.push({
        level: this.logLevel.bunyan_level,
        stream: process.stdout,
      });
    }

    // ログのファイル出力
    if (this.outputToFile) {
      streams.push({
        type: 'raw',
        level: this.logLevel.bunyan_level,
        stream: new RotateFileStream({
          path: path.join(this.logFileSetting.directory_path, this.logFileSetting.file_name),
          period: this.logFileSetting.rotate.period,
          totalFiles: this.logFileSetting.rotate.count,
          threshold: this.logFileSetting.rotate.threshold_size,
          totalSize: this.logFileSetting.rotate.max_total_size,
        }),
      });
    }

    // ログのsyslog出力
    if (this.outputToSyslog) {
      const bunyanStreamSetting = {
        type: 'sys',
        facility: bsyslog.local0,
      };

      let bunyanSyslogLevel = this.logLevel.bunyan_level;
      if (this.syslogSetting) {
        bunyanStreamSetting.type = this.syslogSetting.type;
        if (this.syslogSetting.host !== undefined) {
          bunyanStreamSetting.host = this.syslogSetting.host;
        }
        if (this.syslogSetting.port !== undefined) {
          bunyanStreamSetting.port = this.syslogSetting.port;
        }
        bunyanStreamSetting.facility = this.syslogSetting.facility;
        bunyanSyslogLevel = this.syslogSetting.log_level;
      }
      streams.push({
        type: 'raw',
        level: bunyanSyslogLevel.bunyan_level,
        stream: bsyslog.createBunyanStream(bunyanStreamSetting),
      });
    }

    this.bunyan_logger = bunyan.createLogger({
      name: 'terminalLog',
      streams,
    });
  }

  setLogLevel(logLevel) {
    const functionName = 'Flexlog.setLogLevel';
    if (Object.values(PRIORITY).indexOf(logLevel) === -1) {
      // eslint-disable-next-line no-console
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
    this.bunyan_logger.debug(message.join(' '));
  }

  info(...message) {
    if (this.logLevel.priority < PRIORITY.info.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('Flexlog.info:', 'Bad message.');
      return;
    }
    this.bunyan_logger.info(message.join(' '));
  }

  warn(...message) {
    if (this.logLevel.priority < PRIORITY.warn.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('Flexlog.warn:', 'Bad message.');
      return;
    }
    this.bunyan_logger.warn(message.join(' '));
  }

  err(...message) {
    if (this.logLevel.priority < PRIORITY.err.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('Flexlog.err:', 'Bad message.');
      return;
    }
    this.bunyan_logger.error(message.join(' '));
  }

  crit(...message) {
    if (this.logLevel.priority < PRIORITY.crit.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('Flexlog.crit:', 'Bad message.');
      return;
    }
    this.bunyan_logger.fatal(message.join(' '));
  }

  // コンソール出力に関する設定を調整する
  quiet() {
    this.is_noizy_mode = false;
  }

  // コンソール出力に関する設定を調整する
  noizy() {
    this.is_noizy_mode = true;
  }

  // ファイル出力をするかどうか？と出力先を変更する
  setOutputFile(directoryPath, fileName) {
    this.logFileSetting.file_name = fileName;
    this.logFileSetting.directory_path = directoryPath;

    const logFileDir = new Directory(this.logFileSetting.directory_path);
    if (!logFileDir.isExist()) {
      logFileDir.create();
    }

    this.outputToFile = true;
  }

  // Syslog出力をするかどうか？と出力先を変更する
  setSyslog(logLevel = this.logLevel,
    host = undefined,
    port = undefined,
    facility = bsyslog.local0,
    type = 'sys') {
    this.syslogSetting = {
      host,
      port,
      log_level: logLevel,
      facility,
      type,
    };
    this.outputToSyslog = true;
  }

  // ログローテートの期間と保存する世代を指定
  setRotate(period, count, thresholdSize, maxTotalSize) {
    if (period !== undefined) {
      this.logFileSetting.rotate.period = period;
    }

    if (count !== undefined) {
      this.logFileSetting.rotate.count = count;
    }

    if (thresholdSize !== undefined) {
      this.logFileSetting.rotate.threshold_size = thresholdSize;
    }

    if (maxTotalSize !== undefined) {
      this.logFileSetting.rotate.max_totalsize = maxTotalSize;
    }
  }
}

export const flexlog = {
  logger: new Flexlog(PRIORITY.debug),
};
