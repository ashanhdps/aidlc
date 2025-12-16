#!/usr/bin/env node

/**
 * Full Demo Test Script for Unit4 Frontend Application
 * Comprehensive testing of all routes and functionality
 */

import http from 'http';
import { URL } from 'url';

const BASE_URL = 'http://localhost:3001';

// Extended test configuration
const tests = [
  {
    name: 'Main Application Page',
    path: '/',
    expectedStatus: 200,
    expectedContent: ['html', 'root']
  },
  {
    name: 'Login Page',
    path: '/login',
    expectedStatus: 200,
    expectedContent: ['html']
  },
  {
    name: 'Dashboard Page',
    path: '/dashboard',
    expectedStatus: 200,
    expectedContent: ['html']
  },
  {
    name: 'Assessment Page',
    path: '/assessment',
    expectedStatus: 200,
    expectedContent: ['html']
  },
  {
    name: 'Feedback Page',
    path: '/feedback',
    expectedStatus: 200,
    expectedContent: ['html']
  },
  {
    name: 'Settings Page',
    path: '/settings',
    expectedStatus: 200,
    expectedContent: ['html']
  },
  {
    name: 'Team Dashboard',
    path: '/team-dashboard',
    expectedStatus: 200,
    expectedContent: ['html']
  },
  {
    name: 'Executive Dashboard',
    path: '/executive-dashboard',
    expectedStatus: 200,
    expectedContent: ['html']
  },
  {
    name: 'Vite Client Assets',
    path: '/@vite/client',
    expectedStatus: 200,
    expectedContent: ['vite']
  }
];

// Simple HTTP request function
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Full Demo Test Suite for Unit4 Frontend Application\n');
  console.log('=' .repeat(60) + '\n');
  
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`📋 Testing: ${test.name}`);
      console.log(`   Path: ${test.path}`);
      const response = await makeRequest(BASE_URL + test.path);
      
      // Check status code
      if (response.status === test.expectedStatus) {
        console.log(`   ✅ Status: ${response.status} (Expected: ${test.expectedStatus})`);
      } else {
        console.log(`   ❌ Status: ${response.status} (Expected: ${test.expectedStatus})`);
        failed++;
        console.log(`   ❌ ${test.name} - FAILED\n`);
        continue;
      }

      // Check content
      let contentPassed = true;
      for (const expectedContent of test.expectedContent) {
        if (response.body.toLowerCase().includes(expectedContent.toLowerCase())) {
          console.log(`   ✅ Content contains: "${expectedContent}"`);
        } else {
          console.log(`   ❌ Content missing: "${expectedContent}"`);
          contentPassed = false;
        }
      }

      if (contentPassed) {
        passed++;
        console.log(`   ✅ ${test.name} - PASSED\n`);
      } else {
        failed++;
        console.log(`   ❌ ${test.name} - FAILED\n`);
      }

    } catch (error) {
      console.log(`   ❌ ${test.name} - ERROR: ${error.message}\n`);
      failed++;
    }
  }

  // Summary
  console.log('=' .repeat(60));
  console.log('\n📊 FULL DEMO TEST RESULTS SUMMARY:\n');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log(`   📋 Total Tests: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! The Unit4 Frontend Application is fully ready for demo.');
    console.log('\n📱 Application URL: http://localhost:3001/');
    console.log('🔗 Available Routes:');
    tests.forEach(test => {
      console.log(`   • ${BASE_URL}${test.path} - ${test.name}`);
    });
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the application setup.');
    process.exit(1);
  }
}

// Application health check
async function healthCheck() {
  console.log('🏥 Running Application Health Checks\n');
  
  try {
    const response = await makeRequest(BASE_URL);
    console.log('✅ Server is responsive');
    
    if (response.body.includes('react') || response.body.includes('vite')) {
      console.log('✅ React/Vite application detected');
    }
    
    if (response.body.includes('root')) {
      console.log('✅ React root element present');
    }
    
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.log('✅ Serving HTML content');
    }
    
    console.log('✅ Health check completed successfully\n');
    
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}\n`);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('\n' + '🌟'.repeat(30));
  console.log('\n   UNIT4 FRONTEND APPLICATION - FULL DEMO TEST\n');
  console.log('🌟'.repeat(30) + '\n');
  
  try {
    await healthCheck();
    await runTests();
  } catch (error) {
    console.error('💥 Demo test failed:', error.message);
    process.exit(1);
  }
}

main();