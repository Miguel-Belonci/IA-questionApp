function uniqueEmail(prefix = "e2e") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.com`;
}

function apiUrl(path) {
  return `${Cypress.env("apiUrl")}${path}`;
}

Cypress.Commands.add("registerByApi", (overrides = {}) => {
  const user = {
    name: "E2E User",
    email: uniqueEmail(),
    password: "123456",
    ...overrides,
  };

  return cy
    .request("POST", apiUrl("/auth/register"), user)
    .then((response) => ({ ...response.body, credentials: user }));
});

Cypress.Commands.add("loginByApi", (credentials) => {
  return cy
    .request("POST", apiUrl("/auth/login"), credentials)
    .then((response) => ({ ...response.body, credentials }));
});

Cypress.Commands.add("loginWithToken", (token) => {
  cy.window().then((window) => {
    window.localStorage.setItem("token", token);
  });
});

Cypress.Commands.add("visitAs", (path, token) => {
  cy.visit(path, {
    onBeforeLoad(window) {
      window.localStorage.setItem("token", token);
    },
  });
});

Cypress.Commands.add(
  "createRoomByApi",
  ({ token, name = "Sala E2E", password = "12345" }) => {
    return cy
      .request({
        method: "POST",
        url: apiUrl("/rooms"),
        headers: { Authorization: `Bearer ${token}` },
        body: { name, password },
      })
      .then((response) => response.body.room);
  },
);

Cypress.Commands.add(
  "createQuestionByApi",
  ({ token, roomCode, text = "Pergunta E2E" }) => {
    return cy
      .request({
        method: "POST",
        url: apiUrl("/questions"),
        headers: { Authorization: `Bearer ${token}` },
        body: { roomCode, text },
      })
      .then((response) => response.body.question);
  },
);

Cypress.Commands.add("getAdminSession", () => {
  const email = Cypress.env("adminEmail");
  const password = Cypress.env("adminPassword");

  if (email && password) {
    return cy.loginByApi({ email, password });
  }

  return cy.registerByApi({
    name: "E2E Admin Candidate",
    email: uniqueEmail("e2e-admin"),
  });
});
