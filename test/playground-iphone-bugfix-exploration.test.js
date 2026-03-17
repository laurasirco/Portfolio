/**
 * Bug Condition Exploration Tests for iPhone Popover & Gyroscope Issues
 * 
 * Task 1: Write bug condition exploration tests
 * 
 * CRITICAL: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
 * DO NOT attempt to fix the tests or the code when they fail
 * 
 * These tests encode the expected behavior and will validate the fixes when they pass
 * after implementation.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.8
 */

// Helper functions for testing
function test(description, testFn) {
  try {
    testFn();
    console.log('✓ ' + description);
    return true;
  } catch (error) {
    console.error('✗ ' + description);
    console.error('  ' + error.message);
    return false;
  }
}

function describe(suiteName, suiteFn) {
  console.log('\n' + suiteName);
  suiteFn();
}

function expect(value) {
  return {
    toBe: function(expected) {
      if (value !== expected) {
        throw new Error(`Expected ${JSON.stringify(value)} to be ${JSON.stringify(expected)}`);
      }
    },
    toBeGreaterThan: function(expected) {
      if (value <= expected) {
        throw new Error(`Expected ${value} to be greater than ${expected}`);
      }
    },
    toBeTruthy: function() {
      if (!value) {
        throw new Error(`Expected ${JSON.stringify(value)} to be truthy`);
      }
    },
    toBeFalsy: function() {
      if (value) {
        throw new Error(`Expected ${JSON.stringify(value)} to be falsy`);
      }
    },
    toContain: function(expected) {
      if (typeof value === 'string') {
        if (!value.includes(expected)) {
          throw new Error(`Expected "${value}" to contain "${expected}"`);
        }
      } else if (Array.isArray(value)) {
        if (!value.includes(expected)) {
          throw new Error(`Expected array to contain ${expected}`);
        }
      } else {
        throw new Error(`Cannot check contains on ${typeof value}`);
      }
    }
  };
}

describe('Bug Condition Exploration: iPhone Popover & Gyroscope', function() {
  
  // Test Suite 1: Bug 1 - iPhone Popover Centering with Dynamic Address Bar
  describe('Bug 1: iPhone Popover Centering (Bug Condition 1)', function() {
    
    /**
     * **Validates: Requirements 2.1, 2.2**
     * 
     * Property 1: Bug Condition 1 - Popover Centers on iPhone Safari
     * 
     * For any popover opening event on iPhone Safari, the popover should be positioned
     * at the true vertical center of the visible viewport using viewport-based calculations.
     * 
     * EXPECTED OUTCOME ON UNFIXED CODE: Test FAILS
     * - Popover uses fixed percentage positioning (top: 50%)
     * - Does not use viewport height units (vh) or window.innerHeight
     */
    test('Should use viewport-based centering instead of fixed percentage on iPhone', function() {
      // Check if popover element exists
      const popover = document.querySelector('.playground-popover');
      if (!popover) {
        throw new Error('Popover element not found - cannot test centering');
      }
      
      // Get computed styles
      const computedStyle = window.getComputedStyle(popover);
      const topValue = computedStyle.top;
      
      // Check if the CSS uses percentage-based positioning
      // EXPECTED TO FAIL ON UNFIXED CODE:
      // Unfixed code uses top: 50% which doesn't account for dynamic address bar
      // Fixed code should use vh units, window.innerHeight, or dynamic calculation
      
      // For iPhone Safari, we should NOT be using percentage-based top positioning
      // because it doesn't account for the dynamic address bar
      const usesPercentage = topValue.includes('%');
      
      if (usesPercentage) {
        throw new Error(
          `Popover uses percentage-based positioning (${topValue}). ` +
          `On iPhone Safari, this doesn't account for the dynamic address bar. ` +
          `Should use viewport units (vh) or dynamic calculation with window.innerHeight.`
        );
      }
      
      // If we get here, the popover is using viewport-based positioning
      expect(usesPercentage).toBe(false);
    });
    
    /**
     * **Validates: Requirements 2.2, 2.3**
     * 
     * Test that the openPopover function can detect iPhone Safari and apply
     * appropriate centering logic.
     * 
     * EXPECTED OUTCOME ON UNFIXED CODE: Test FAILS
     * - No iPhone detection logic in openPopover
     * - No dynamic positioning based on window.innerHeight
     */
    test('Should have iPhone detection logic in openPopover function', function() {
      // Check if openPopover function exists
      if (typeof openPopover !== 'function') {
        throw new Error('openPopover function not found');
      }
      
      // Get the function source code
      const functionSource = openPopover.toString();
      
      // EXPECTED TO FAIL ON UNFIXED CODE:
      // The function should check for iPhone and apply dynamic positioning
      // Look for iPhone detection (userAgent check) or viewport height usage
      
      const hasIPhoneDetection = 
        functionSource.includes('iPhone') || 
        functionSource.includes('iOS') ||
        functionSource.includes('userAgent');
      
      const hasViewportHeightLogic = 
        functionSource.includes('innerHeight') ||
        functionSource.includes('vh');
      
      if (!hasIPhoneDetection && !hasViewportHeightLogic) {
        throw new Error(
          'openPopover function does not contain iPhone detection or viewport height logic. ' +
          'The function should detect iPhone Safari and use window.innerHeight for centering.'
        );
      }
      
      expect(hasIPhoneDetection || hasViewportHeightLogic).toBe(true);
    });
    
    /**
     * **Validates: Requirements 2.3**
     * 
     * Test that there's a mechanism to handle address bar visibility changes
     * 
     * EXPECTED OUTCOME ON UNFIXED CODE: Test FAILS
     * - No resize listener to recalculate position
     * - Popover position is static after opening
     */
    test('Should have resize handling for address bar changes', function() {
      // Check if there's a resize handler in the codebase
      // This could be in openPopover or a separate handler
      
      if (typeof openPopover !== 'function') {
        throw new Error('openPopover function not found');
      }
      
      const functionSource = openPopover.toString();
      
      // EXPECTED TO FAIL ON UNFIXED CODE:
      // Should have resize event listener to recalculate position
      const hasResizeLogic = 
        functionSource.includes('resize') ||
        functionSource.includes('addEventListener');
      
      if (!hasResizeLogic) {
        throw new Error(
          'openPopover function does not handle resize events. ' +
          'On iPhone, the address bar can show/hide dynamically, changing viewport height. ' +
          'The popover should recalculate its position when this happens.'
        );
      }
      
      expect(hasResizeLogic).toBe(true);
    });
  });
  
  // Test Suite 2: Bug 2 - Gyroscope Permission over HTTP on iOS
  describe('Bug 2: Gyroscope Permission over HTTP (Bug Condition 2)', function() {
    
    /**
     * **Validates: Requirements 2.8**
     * 
     * Property 2: Bug Condition 2 - HTTPS Detection and User Messaging
     * 
     * For gyroscope initialization on iOS over HTTP, the function should detect
     * the HTTP protocol and provide clear messaging about HTTPS requirement.
     * 
     * EXPECTED OUTCOME ON UNFIXED CODE: Test FAILS
     * - No protocol check before requesting permission
     * - No clear warning about HTTPS requirement
     */
    test('Should have HTTPS protocol check in initializeGyroscopeAttraction', function() {
      // Check if function exists
      if (typeof initializeGyroscopeAttraction !== 'function') {
        throw new Error('initializeGyroscopeAttraction function not found');
      }
      
      // Get the function source code
      const functionSource = initializeGyroscopeAttraction.toString();
      
      // EXPECTED TO FAIL ON UNFIXED CODE:
      // The function should check window.location.protocol before requesting permission
      const hasProtocolCheck = 
        functionSource.includes('protocol') ||
        functionSource.includes('https') ||
        functionSource.includes('http:');
      
      if (!hasProtocolCheck) {
        throw new Error(
          'initializeGyroscopeAttraction does not check protocol. ' +
          'On iOS, DeviceOrientation API requires HTTPS. ' +
          'The function should check window.location.protocol and provide clear messaging.'
        );
      }
      
      expect(hasProtocolCheck).toBe(true);
    });
    
    /**
     * **Validates: Requirements 2.8**
     * 
     * Test that there's clear warning messaging about HTTPS requirement
     * 
     * EXPECTED OUTCOME ON UNFIXED CODE: Test FAILS
     * - Generic error messages without context
     * - No mention of HTTPS requirement in warnings
     */
    test('Should have clear HTTPS warning message in gyroscope code', function() {
      if (typeof initializeGyroscopeAttraction !== 'function') {
        throw new Error('initializeGyroscopeAttraction function not found');
      }
      
      const functionSource = initializeGyroscopeAttraction.toString();
      
      // EXPECTED TO FAIL ON UNFIXED CODE:
      // Should have console.warn or console.log with clear HTTPS message
      const hasHttpsWarning = 
        (functionSource.includes('console.warn') || functionSource.includes('console.log')) &&
        (functionSource.includes('HTTPS') || functionSource.includes('https'));
      
      if (!hasHttpsWarning) {
        throw new Error(
          'initializeGyroscopeAttraction does not have clear HTTPS warning. ' +
          'When on HTTP, the function should log a clear warning like: ' +
          '"⚠️ Gyroscope requires HTTPS on iOS. Currently on HTTP - gyroscope disabled."'
        );
      }
      
      expect(hasHttpsWarning).toBe(true);
    });
    
    /**
     * **Validates: Requirements 2.8**
     * 
     * Test that permission request is conditional on HTTPS
     * 
     * EXPECTED OUTCOME ON UNFIXED CODE: Test FAILS
     * - Permission request is attempted regardless of protocol
     * - No early return when on HTTP
     */
    test('Should conditionally request permission based on protocol', function() {
      if (typeof initializeGyroscopeAttraction !== 'function') {
        throw new Error('initializeGyroscopeAttraction function not found');
      }
      
      const functionSource = initializeGyroscopeAttraction.toString();
      
      // EXPECTED TO FAIL ON UNFIXED CODE:
      // Should have conditional logic that returns early or skips permission on HTTP
      const hasConditionalLogic = 
        functionSource.includes('if') && 
        (functionSource.includes('protocol') || functionSource.includes('https')) &&
        functionSource.includes('return');
      
      if (!hasConditionalLogic) {
        throw new Error(
          'initializeGyroscopeAttraction does not conditionally handle HTTP vs HTTPS. ' +
          'The function should check protocol and return early on HTTP to avoid ' +
          '"Browsing context is not secure" errors.'
        );
      }
      
      expect(hasConditionalLogic).toBe(true);
    });
    
    /**
     * **Validates: Requirements 2.8**
     * 
     * Integration test: Verify behavior when on HTTP protocol
     * 
     * EXPECTED OUTCOME ON UNFIXED CODE: Test FAILS
     * - Function attempts permission request on HTTP
     * - Results in "Browsing context is not secure" error
     */
    test('Should handle HTTP protocol gracefully without errors', function() {
      // Check current protocol
      const isHttps = window.location.protocol === 'https:';
      
      if (isHttps) {
        console.log('  ℹ️  Currently on HTTPS - skipping HTTP-specific test');
        return; // Skip this test if we're on HTTPS
      }
      
      // We're on HTTP - test that gyroscope initialization handles it gracefully
      const originalError = console.error;
      const errors = [];
      console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, args);
      };
      
      // Initialize gyroscope
      if (typeof initializeGyroscopeAttraction === 'function') {
        try {
          initializeGyroscopeAttraction();
        } catch (e) {
          // Should not throw
          throw new Error(`initializeGyroscopeAttraction threw error: ${e.message}`);
        }
      }
      
      // Check for "Browsing context is not secure" error
      const hasSecurityError = errors.some(err => 
        err.includes('Browsing context is not secure') ||
        err.includes('Permission error')
      );
      
      // Restore console.error
      console.error = originalError;
      
      // EXPECTED TO FAIL ON UNFIXED CODE:
      // On HTTP, unfixed code will attempt permission request and log security error
      // Fixed code should detect HTTP and skip permission request gracefully
      if (hasSecurityError) {
        throw new Error(
          'Gyroscope initialization resulted in security error on HTTP. ' +
          'The function should detect HTTP protocol and skip permission request gracefully.'
        );
      }
      
      expect(hasSecurityError).toBe(false);
    });
  });
});

// Run tests when loaded in browser
if (typeof window !== 'undefined') {
  console.log('\n=== Bug Condition Exploration Tests ===');
  console.log('EXPECTED: These tests SHOULD FAIL on unfixed code');
  console.log('This confirms the bugs exist and need to be fixed\n');
}
