async function testHttpEndpoints() {
  console.log("==========================================");
  console.log("🌐 TESTING LOCAL SERVER HTTP ENDPOINTS");
  console.log("==========================================");

  const baseUrl = "http://localhost:3000";
  let passed = 0;
  let failed = 0;

  const endpoints = [
    { path: "/", type: "Frontend Page" },
    { path: "/admin", type: "Admin Page" },
    { path: "/admin/ads-setup", type: "Admin Ads Setup Page" },
    { path: "/admin/ai-tools", type: "Admin AI Tools Page" },
    { path: "/api/deals", type: "Backend API (GET)" },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${ep.path}`);
      if (res.status === 200) {
        console.log(`  ✅ [${ep.type}] ${ep.path} -> HTTP Status ${res.status} OK`);
        passed++;
      } else {
        console.error(`  ❌ [${ep.type}] ${ep.path} -> HTTP Status ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`  ❌ [${ep.type}] ${ep.path} -> Connection Failed: ${(err as Error).message}`);
      failed++;
    }
  }

  // Test POST /api/contact
  try {
    const res = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@luoidonnha.com",
        message: "Kiểm tra gửi tin nhắn từ hệ thống test",
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      console.log(`  ✅ [Backend API] POST /api/contact -> HTTP Status 200 OK (${data.message})`);
      passed++;
    } else {
      console.error(`  ❌ [Backend API] POST /api/contact -> HTTP ${res.status}`, data);
      failed++;
    }
  } catch (err) {
    console.error(`  ❌ [Backend API] POST /api/contact -> ${(err as Error).message}`);
    failed++;
  }

  // Test POST /api/newsletter
  try {
    const res = await fetch(`${baseUrl}/api/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "subscriber@luoidonnha.com",
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      console.log(`  ✅ [Backend API] POST /api/newsletter -> HTTP Status 200 OK (${data.message})`);
      passed++;
    } else {
      console.error(`  ❌ [Backend API] POST /api/newsletter -> HTTP ${res.status}`, data);
      failed++;
    }
  } catch (err) {
    console.error(`  ❌ [Backend API] POST /api/newsletter -> ${(err as Error).message}`);
    failed++;
  }

  console.log("\n==========================================");
  console.log(`🎉 HTTP TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");
}

testHttpEndpoints();
