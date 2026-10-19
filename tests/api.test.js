// import request from "supertest";

// const api = request("http://127.0.0.1:3000");

// describe("AI Mini Tracking Tool API", () => {
//   test("GET /api/health returns 200", async () => {
//     const response = await api.get("/api/health");

//     expect(response.status).toBe(200);
//     expect(response.body.success).toBe(true);
//   });

//   test("POST /api/issues rejects missing fields", async () => {
//     const response = await api
//       .post("/api/issues")
//       .send({});

//     expect(response.status).toBe(400);
//     expect(response.body.success).toBe(false);
//   });

//   test("POST /api/issues rejects an empty title", async () => {
//     const response = await api
//       .post("/api/issues")
//       .send({
//         title: "   ",
//         description: "A sample test description",
//       });

//     expect(response.status).toBe(400);
//     expect(response.body.success).toBe(false);
//   });
// });


// import request from "supertest";

// const api = request("http://127.0.0.1:3000");

// describe("AI Mini Tracking Tool API", () => {
//   test("Health endpoint remains public", async () => {
//     const response = await api.get("/api/health");

//     expect(response.status).toBe(200);
//     expect(response.body.success).toBe(true);
//   });

//   test("Issue list rejects requests without a token", async () => {
//     const response = await api.get("/api/issues");

//     expect(response.status).toBe(401);
//     expect(response.body.success).toBe(false);
//   });

//   test("Issue creation rejects requests without a token", async () => {
//     const response = await api
//       .post("/api/issues")
//       .send({
//         title: "Test issue",
//         description: "This request should be blocked",
//       });

//     expect(response.status).toBe(401);
//     expect(response.body.success).toBe(false);
//   });
// });


// import request from "supertest";

// const api = request("http://127.0.0.1:3000");

// // Use your existing local test accounts.
// const developer = {
//   email: "test.dev@example.com",
//   password: "TestDev123!",
// };

// const admin = {
//   email: "demo.dev@example.com",
//   password: "DevPass123!",
// };

// async function login(credentials) {
//   const response = await api
//     .post("/api/auth/login")
//     .send(credentials);

//   expect(response.status).toBe(200);
//   expect(response.body.token).toBeTruthy();

//   return response.body.token;
// }

// describe("AI Mini Tracking Tool API", () => {
//   test("Health endpoint remains public", async () => {
//     const response = await api.get("/api/health");

//     expect(response.status).toBe(200);
//     expect(response.body.success).toBe(true);
//   });

//   test("Issue list rejects requests without a token", async () => {
//     const response = await api.get("/api/issues");

//     expect(response.status).toBe(401);
//     expect(response.body.success).toBe(false);
//   });

//   test("Issue creation rejects requests without a token", async () => {
//     const response = await api.post("/api/issues").send({
//       title: "Test issue",
//       description: "This request should be blocked",
//     });

//     expect(response.status).toBe(401);
//     expect(response.body.success).toBe(false);
//   });

//   test("Developer cannot delete an issue", async () => {
//     const token = await login(developer);

//     // Create a temporary issue using the Developer token.
//     const created = await api
//       .post("/api/issues")
//       .set("Authorization", `Bearer ${token}`)
//       .send({
//         title: "RBAC test issue",
//         description: "Temporary issue for permission testing",
//         priority: "Low",
//       });

//     expect(created.status).toBe(201);
//     // console.log("Issue creation response:", created.body);

//     const issueId = created.body.data.id;

//     expect(issueId).toBeTruthy();

//     const response = await api
//       .delete(`/api/issues/${issueId}`)
//       .set("Authorization", `Bearer ${token}`);

//     expect(response.status).toBe(403);
//     expect(response.body.success).toBe(false);

//     // Confirm the issue still exists.
//     const check = await api
//       .get(`/api/issues/${issueId}`)
//       .set("Authorization", `Bearer ${token}`);

//     expect(check.status).toBe(200);

//     // Clean up the temporary issue using the Admin account.
//     const adminToken = await login(admin);

//     const cleanup = await api
//       .delete(`/api/issues/${issueId}`)
//       .set("Authorization", `Bearer ${adminToken}`);

//     expect(cleanup.status).toBe(200);
//   });

//   test("Admin can delete an issue", async () => {
//     const token = await login(admin);

//     const created = await api
//       .post("/api/issues")
//       .set("Authorization", `Bearer ${token}`)
//       .send({
//         title: "Admin deletion test",
//         description: "Temporary issue for Admin permission testing",
//         priority: "Low",
//       });

//     expect(created.status).toBe(201);

//     const issueId = created.body.data.id;

//     expect(issueId).toBeTruthy();

//     const response = await api
//       .delete(`/api/issues/${issueId}`)
//       .set("Authorization", `Bearer ${token}`);

//     expect(response.status).toBe(200);
//     expect(response.body.success).toBe(true);
//     expect(response.body.message).toBe("Issue deleted successfully");
//   });
// });


import request from "supertest";

const api = request("http://127.0.0.1:3000");

const developer = {
    email: "test.dev@example.com",
    password: "TestDev123!",
};

const admin = {
    email: "demo.dev@example.com",
    password: "DevPass123!",
};

async function login(credentials) {
    const response = await api
        .post("/api/auth/login")
        .send(credentials);

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();

    return response.body.token;
}

async function createIssue(token, title) {
    const response = await api
        .post("/api/issues")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title,
            description: "Temporary issue for automated testing",
            priority: "Low",
        });

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBeTruthy();

    return response.body.data.id;
}

async function deleteIssue(token, issueId) {
    const response = await api
        .delete(`/api/issues/${issueId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
}

describe("AI Mini Tracking Tool API", () => {
    test("Health endpoint remains public", async () => {
        const response = await api.get("/api/health");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });


    test("Developer cannot generate an AI summary for an Admin-owned issue", async () => {
        const developerToken = await login(developer);
        const adminToken = await login(admin);

        const adminIssueId = await createIssue(
            adminToken,
            "AI summary ownership security test"
        );

        const response = await api
            .post(`/api/issues/${adminIssueId}/ai-summary`)
            .set("Authorization", `Bearer ${developerToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Issue not found");

        await deleteIssue(adminToken, adminIssueId);
    });



    test("AI summary rejects an empty issue description", async () => {
        const token = await login(developer);

        const response = await api
            .post("/api/ai/summarize")
            .set("Authorization", `Bearer ${token}`)
            .send({
                issueDescription: "   ",
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "issueDescription is required"
        );
    });

    test("AI summary rejects descriptions exceeding 6000 characters", async () => {
        const token = await login(developer);

        const response = await api
            .post("/api/ai/summarize")
            .set("Authorization", `Bearer ${token}`)
            .send({
                issueDescription: "A".repeat(6001),
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "issueDescription must not exceed 6000 characters"
        );
    });


    test("Issue list rejects requests without a token", async () => {
        const response = await api.get("/api/issues");

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Issue creation rejects requests without a token", async () => {
        const response = await api.post("/api/issues").send({
            title: "Test issue",
            description: "This request should be blocked",
        });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("Developer cannot delete an issue", async () => {
        const developerToken = await login(developer);
        const adminToken = await login(admin);

        const issueId = await createIssue(
            developerToken,
            "Developer deletion permission test"
        );

        const response = await api
            .delete(`/api/issues/${issueId}`)
            .set("Authorization", `Bearer ${developerToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);

        const check = await api
            .get(`/api/issues/${issueId}`)
            .set("Authorization", `Bearer ${developerToken}`);

        expect(check.status).toBe(200);

        await deleteIssue(adminToken, issueId);
    });

    test("Admin can delete an issue", async () => {
        const adminToken = await login(admin);

        const issueId = await createIssue(
            adminToken,
            "Admin deletion permission test"
        );

        const response = await api
            .delete(`/api/issues/${issueId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Issue deleted successfully");
    });

    test("Developer sees own issues while Admin sees all users' issues", async () => {
        const developerToken = await login(developer);
        const adminToken = await login(admin);

        const developerIssueId = await createIssue(
            developerToken,
            "Developer ownership visibility test"
        );

        const adminIssueId = await createIssue(
            adminToken,
            "Admin ownership visibility test"
        );

        const developerList = await api
            .get("/api/issues")
            .set("Authorization", `Bearer ${developerToken}`);

        expect(developerList.status).toBe(200);

        const developerIds = developerList.body.data.map(
            (issue) => issue.id
        );

        expect(developerIds).toContain(developerIssueId);
        expect(developerIds).not.toContain(adminIssueId);

        const adminList = await api
            .get("/api/issues")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(adminList.status).toBe(200);

        const adminIds = adminList.body.data.map(
            (issue) => issue.id
        );

        expect(adminIds).toContain(developerIssueId);
        expect(adminIds).toContain(adminIssueId);

        await deleteIssue(adminToken, developerIssueId);
        await deleteIssue(adminToken, adminIssueId);
    });

    test("Developer cannot view or update an Admin-owned issue", async () => {
        const developerToken = await login(developer);
        const adminToken = await login(admin);

        const adminIssueId = await createIssue(
            adminToken,
            "Cross-user access restriction test"
        );

        const getResponse = await api
            .get(`/api/issues/${adminIssueId}`)
            .set("Authorization", `Bearer ${developerToken}`);

        expect(getResponse.status).toBe(404);
        expect(getResponse.body.message).toBe("Issue not found");

        const patchResponse = await api
            .patch(`/api/issues/${adminIssueId}`)
            .set("Authorization", `Bearer ${developerToken}`)
            .send({
                status: "In Progress",
            });

        expect(patchResponse.status).toBe(404);
        expect(patchResponse.body.message).toBe("Issue not found");

        // Verify the Admin-owned issue was not modified.
        const adminCheck = await api
            .get(`/api/issues/${adminIssueId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(adminCheck.status).toBe(200);
        expect(adminCheck.body.data.status).toBe("Open");

        await deleteIssue(adminToken, adminIssueId);
    });


    test("AI summary endpoint rejects requests without a token", async () => {
        const response = await api
            .post("/api/ai/summarize")
            .send({
                issueDescription: "The application returns an error during login",
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

});