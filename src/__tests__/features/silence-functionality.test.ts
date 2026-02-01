import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createLogger,
  getGlobalSilenced,
  setGlobalSilenced,
  ColorLevel,
  logger,
} from '@/index';

describe('Silence functionality', () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setGlobalSilenced(false);
  });

  afterEach(() => {
    setGlobalSilenced(false);
    consoleInfoSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('per-logger silence', () => {
    it('should produce no output when silenced', () => {
      const log = createLogger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });
      log.info('before');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);

      log.silence();
      log.info('hidden');
      log.debug('hidden too');
      log.warn('hidden too');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should restore output when unsilenced', () => {
      const log = createLogger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });
      log.silence();
      log.info('hidden');
      expect(consoleInfoSpy).not.toHaveBeenCalled();

      log.unsilence();
      log.info('after');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });

    it('should report isSilenced correctly', () => {
      const log = createLogger();
      expect(log.isSilenced()).toBe(false);
      log.silence();
      expect(log.isSilenced()).toBe(true);
      log.unsilence();
      expect(log.isSilenced()).toBe(false);
    });

    it('should support createLogger({ silenced: true })', () => {
      const quiet = createLogger({
        silenced: true,
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });
      quiet.info('never');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      quiet.unsilence();
      quiet.info('now');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });

    it('should allow chaining silence() with logging', () => {
      const log = createLogger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });
      log.silence().info('hidden');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should include silenced in getOptions and preserve when creating derived logger', () => {
      const log = createLogger({ prefix: 'App' });
      log.silence();
      expect(log.getOptions().silenced).toBe(true);

      const prefixed = log.withPrefix('X');
      expect(prefixed.getOptions().silenced).toBe(true);
    });
  });

  describe('global silence', () => {
    it('should silence all loggers when setGlobalSilenced(true)', () => {
      const log1 = createLogger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });
      const log2 = createLogger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });
      setGlobalSilenced(true);
      log1.info('hidden');
      log2.info('hidden');
      logger.info('hidden');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should restore output when setGlobalSilenced(false)', () => {
      setGlobalSilenced(true);
      const log = createLogger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });
      log.info('hidden');
      expect(consoleInfoSpy).not.toHaveBeenCalled();

      setGlobalSilenced(false);
      log.info('after');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });

    it('should report getGlobalSilenced correctly', () => {
      expect(getGlobalSilenced()).toBe(false);
      setGlobalSilenced(true);
      expect(getGlobalSilenced()).toBe(true);
      setGlobalSilenced(false);
      expect(getGlobalSilenced()).toBe(false);
    });
  });

  describe('interaction: global and per-logger', () => {
    it('should be silent when global is on and instance is off', () => {
      const log = createLogger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });
      setGlobalSilenced(true);
      log.info('hidden');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should be silent when global is off and instance is on', () => {
      const log = createLogger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });
      log.silence();
      log.info('hidden');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should not be silent when both are off', () => {
      const log = createLogger({
        colorLevel: ColorLevel.NONE,
        timestamped: false,
      });
      setGlobalSilenced(false);
      log.unsilence();
      log.info('visible');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });
});
