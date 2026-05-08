describe("admin pages", () => {
  it("shows admin links in the user menu and lists users", () => {
    cy.getAdminSession().then(({ token, user }) => {
      if (user.role !== "admin") {
        cy.log(
          "Skipping admin UI check: provide CYPRESS_adminEmail/CYPRESS_adminPassword or run against a clean database.",
        );
        return;
      }

      cy.visitAs("/home", token);
      cy.get('button[title="Abrir menu"]').click();
      cy.contains("a", "Usuarios").should("be.visible").click();

      cy.location("pathname").should("eq", "/admin/users");
      cy.contains("h1", "Usuarios").should("be.visible");
      cy.contains("th", "Email").should("be.visible");
      cy.contains(user.email).should("be.visible");
      cy.contains("button", "Inativar").should("be.disabled");
    });
  });

  it("lists rooms and filters them by user", () => {
    cy.getAdminSession().then(({ token, user }) => {
      if (user.role !== "admin") {
        cy.log(
          "Skipping admin room check: provide CYPRESS_adminEmail/CYPRESS_adminPassword or run against a clean database.",
        );
        return;
      }

      cy.createRoomByApi({
        token,
        name: "Sala Admin Cypress",
        password: "12345",
      });
      cy.visitAs("/admin/rooms", token);

      cy.contains("h1", "Salas").should("be.visible");
      cy.contains("Sala Admin Cypress").should("be.visible");
      cy.get("#user-filter").select(`${user.name} - ${user.email}`);
      cy.contains("Sala Admin Cypress").should("be.visible");
      cy.contains(user.email).should("be.visible");
    });
  });

  it("redirects regular users away from admin routes", () => {
    cy.registerByApi().then(({ token, user }) => {
      if (user.role === "admin") {
        cy.log(
          "Skipping regular user redirect check: this database made the first E2E user an admin.",
        );
        return;
      }

      cy.visitAs("/admin/users", token);
      cy.location("pathname").should("eq", "/home");
    });
  });
});
