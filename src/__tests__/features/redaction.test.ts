/**
 * Simplified redaction tests for boolean-only redaction
 * Tests the basic key-based redaction that remains in core
 */

import { describe, expect, it } from 'vitest';
import { redactValueWithOptions, redactObjectWithOptions } from '@utils/redaction';

describe('Simplified Redaction (Boolean-Only)', () => {
  describe('redactValueWithOptions', () => {
    describe('boolean configuration', () => {
      it('should not redact when disabled', () => {
        const data = {
          password: 'secret123',
          token: 'abc-def-ghi',
          email: 'user@example.com',
        };

        const result = redactValueWithOptions(data, false) as Record<string, any>;

        expect(result.password).toBe('secret123');
        expect(result.token).toBe('abc-def-ghi');
        expect(result.email).toBe('user@example.com');
      });

      it('should redact sensitive keys when enabled', () => {
        const data = {
          password: 'secret123',
          token: 'abc-def-ghi',
          email: 'user@example.com',
          publicInfo: 'safe data',
        };

        const result = redactValueWithOptions(data, true) as Record<string, any>;

        expect(result.password).toBe('***');
        expect(result.token).toBe('***');
        expect(result.email).toBe('user@example.com'); // Email is not in basic sensitive keys
        expect(result.publicInfo).toBe('safe data');
      });

      it('should not redact string patterns (only object keys)', () => {
        const sensitiveString = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
        const result = redactValueWithOptions(sensitiveString, true);

        // Basic redaction only handles object keys, not string patterns
        expect(result).toBe(sensitiveString);
      });

      it('should handle non-object, non-string values', () => {
        expect(redactValueWithOptions(123, true)).toBe(123);
        expect(redactValueWithOptions(null, true)).toBe(null);
        expect(redactValueWithOptions(undefined, true)).toBe(undefined);
        expect(redactValueWithOptions(true, true)).toBe(true);
      });
    });

    describe('sensitive key patterns', () => {
      it('should match basic sensitive keys', () => {
        const data = {
          password: 'secret',
          passwd: 'secret',
          pwd: 'secret',
          secret: 'secret',
          token: 'secret',
          auth: 'secret',
          authorization: 'secret',
          bearer: 'secret',
          jwt: 'secret',
          key: 'secret',
          apikey: 'secret',
          api_key: 'secret',
        };

        const result = redactValueWithOptions(data, true) as Record<string, any>;

        Object.keys(data).forEach(key => {
          expect(result[key]).toBe('***');
        });
      });

      it('should match substring patterns', () => {
        const data = {
          userPassword: 'secret',
          authToken: 'secret',
          apiKeyValue: 'secret',
          regularData: 'safe',
        };

        const result = redactValueWithOptions(data, true) as Record<string, any>;

        expect(result.userPassword).toBe('***');
        expect(result.authToken).toBe('***');
        expect(result.apiKeyValue).toBe('***');
        expect(result.regularData).toBe('safe');
      });

      it('should match underscore and dash patterns', () => {
        const data = {
          user_password: 'secret',
          'auth-token': 'secret',
          'api_key': 'secret',
          'session-id': 'secret', // session is not in basic sensitive keys
          regular_data: 'safe',
        };

        const result = redactValueWithOptions(data, true) as Record<string, any>;

        expect(result.user_password).toBe('***');
        expect(result['auth-token']).toBe('***');
        expect(result.api_key).toBe('***');
        expect(result['session-id']).toBe('secret'); // session not in basic keys
        expect(result.regular_data).toBe('safe');
      });

      it('should not match partial words incorrectly', () => {
        const data = {
          passwords: 'secret', // Should match (contains password)
          passworded: 'secret', // Should match (contains password)
          mypassword: 'secret', // Should match (contains password)
          notpassword: 'secret', // Should match (contains password)
          unrelated: 'safe',
        };

        const result = redactValueWithOptions(data, true) as Record<string, any>;

        expect(result.passwords).toBe('***');
        expect(result.passworded).toBe('***');
        expect(result.mypassword).toBe('***');
        expect(result.notpassword).toBe('***');
        expect(result.unrelated).toBe('safe');
      });
    });

    describe('edge cases', () => {
      it('should handle null and undefined values', () => {
        expect(redactValueWithOptions(null, true)).toBe(null);
        expect(redactValueWithOptions(undefined, true)).toBe(undefined);
      });

      it('should handle empty objects and strings', () => {
        expect(redactValueWithOptions({}, true)).toEqual({});
        expect(redactValueWithOptions('', true)).toBe('');
      });

      it('should handle arrays', () => {
        const data = [
          { password: 'secret1' },
          { token: 'secret2' },
          'plain string',
          123,
        ];

        const result = redactValueWithOptions(data, true) as any[];

        expect(result[0].password).toBe('***');
        expect(result[1].token).toBe('***');
        expect(result[2]).toBe('plain string');
        expect(result[3]).toBe(123);
      });

      it('should handle nested objects', () => {
        const data = {
          user: {
            profile: {
              name: 'John Doe',
              email: 'john@example.com',
            },
            credentials: {
              password: 'secret123',
            },
          },
          session: {
            token: 'session-token',
            metadata: {
              secret: 'hidden',
            },
          },
        };

        const result = redactValueWithOptions(data, true) as any;

        expect(result.user.profile.name).toBe('John Doe');
        expect(result.user.profile.email).toBe('john@example.com');
        expect(result.user.credentials.password).toBe('***');
        expect(result.session.token).toBe('***');
        expect(result.session.metadata.secret).toBe('***');
      });

      it('should handle circular references', () => {
        const data: any = { name: 'test' };
        data.self = data;

        const result = redactValueWithOptions(data, true) as any;

        expect(result.name).toBe('test');
        expect(result.self).toBe('[Circular Reference]');
      });

      it('should preserve Error objects', () => {
        const error = new Error('Test error');
        const data = { error, password: 'secret' };

        const result = redactValueWithOptions(data, true) as any;

        expect(result.error).toBe(error);
        expect(result.password).toBe('***');
      });
    });
  });

  describe('redactObjectWithOptions', () => {
    it('should be equivalent to redactValueWithOptions for objects', () => {
      const data = { password: 'secret', public: 'data' };

      const result1 = redactValueWithOptions(data, true);
      const result2 = redactObjectWithOptions(data, true);

      expect(result1).toEqual(result2);
    });

    it('should handle circular references with custom WeakSet', () => {
      const data: any = { password: 'secret' };
      data.self = data;

      const result = redactObjectWithOptions(data, true) as any;

      expect(result.password).toBe('***');
      expect(result.self).toBe('[Circular Reference]');
    });

    it('should handle non-object values gracefully', () => {
      expect(redactObjectWithOptions('string', true)).toBe('string');
      expect(redactObjectWithOptions(123, true)).toBe(123);
      expect(redactObjectWithOptions(null, true)).toBe(null);
    });
  });

  describe('performance considerations', () => {
    it('should handle large objects efficiently', () => {
      const largeData: Record<string, any> = {};
      for (let i = 0; i < 1000; i++) {
        largeData[`data${i}`] = `value${i}`;
      }
      largeData.password = 'secret'; // One sensitive key

      const startTime = Date.now();
      const result = redactValueWithOptions(largeData, true) as Record<string, any>;
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
      expect(result.password).toBe('***');
      expect(result.data0).toBe('value0'); // Non-sensitive data preserved
    });

    it('should handle deeply nested objects efficiently', () => {
      const deepData: any = { level0: {} };
      let current = deepData.level0;
      for (let i = 1; i < 10; i++) {
        current[`level${i}`] = {};
        current = current[`level${i}`];
      }
      current.password = 'secret';

      const startTime = Date.now();
      const result = redactValueWithOptions(deepData, true) as any;
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50);
      
      // Navigate to deep password
      let deep = result.level0;
      for (let i = 1; i < 10; i++) {
        deep = deep[`level${i}`];
      }
      expect(deep.password).toBe('***');
    });
  });

  describe('real-world scenarios', () => {
    it('should handle typical API request logging', () => {
      const requestData = {
        method: 'POST',
        url: '/api/users',
        headers: {
          authorization: 'Bearer abc123',
          'content-type': 'application/json',
        },
        body: {
          email: 'john@example.com',
          password: 'secret123',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      };

      const result = redactValueWithOptions(requestData, true) as any;

      expect(result.method).toBe('POST');
      expect(result.headers.authorization).toBe('***');
      expect(result.body.email).toBe('john@example.com');
      expect(result.body.password).toBe('***');
      expect(result.body.profile.firstName).toBe('John');
    });

    it('should handle logging with mixed sensitive and non-sensitive data', () => {
      const mixedData = {
        timestamp: '2023-01-01T00:00:00Z',
        level: 'info',
        message: 'User operation completed',
        context: {
          userId: 'user123',
          sessionId: 'session456',
          operation: 'update_profile',
          sensitive: {
            password: 'oldPassword',
            newPassword: 'newPassword',
          },
        },
        metadata: {
          duration: 150,
          success: true,
        },
      };

      const result = redactValueWithOptions(mixedData, true) as any;

      expect(result.timestamp).toBe('2023-01-01T00:00:00Z');
      expect(result.context.userId).toBe('user123');
      expect(result.context.sensitive.password).toBe('***');
      expect(result.context.sensitive.newPassword).toBe('***');
      expect(result.metadata.success).toBe(true);
    });
  });
});
