describe("room workflow", () => {
  it("creates a room and requires room password to mark a question as read", () => {
    cy.registerByApi().then(({ token }) => {
      cy.visitAs("/home", token);
    });

    cy.get("#room-name").type("Sala Cypress");
    cy.get("#room-password").type("12345");
    cy.contains("button", "Criar e entrar").click();

    cy.location("pathname").should("match", /^\/room\/[A-Z0-9]{6}$/);
    cy.get("textarea").type("Essa pergunta veio do Cypress?");
    cy.contains("button", "Enviar").click();

    cy.contains("Essa pergunta veio do Cypress?").should("be.visible");
    cy.get('button[title="Marcar como lida"]').first().click();
    cy.contains("Informe a senha da sala").should("be.visible");
    cy.get("#room-password").type("12345");
    cy.contains("button", "Confirmar").click();

    cy.contains("Lida").should("be.visible");
  });

  it("blocks management actions when the room password is wrong", () => {
    cy.registerByApi().then(({ token }) => {
      cy.createRoomByApi({
        token,
        name: "Sala senha errada",
        password: "12345",
      }).then((room) => {
        cy.createQuestionByApi({
          token,
          roomCode: room.code,
          text: "Pergunta protegida",
        });
        cy.visitAs(`/room/${room.code}`, token);
      });
    });

    cy.contains("Pergunta protegida").should("be.visible");
    cy.get('button[title="Marcar como lida"]').first().click();
    cy.get("#room-password").type("00000");
    cy.contains("button", "Confirmar").click();
    cy.contains("Senha da sala inválida.").should("be.visible");
    cy.contains("Aberta").should("be.visible");
  });

  it("deletes a question and then deletes the room with the room password", () => {
    cy.registerByApi().then(({ token }) => {
      cy.createRoomByApi({
        token,
        name: "Sala para excluir",
        password: "12345",
      }).then((room) => {
        cy.createQuestionByApi({
          token,
          roomCode: room.code,
          text: "Pergunta para excluir",
        });
        cy.visitAs(`/room/${room.code}`, token);
      });
    });

    cy.contains("Pergunta para excluir").should("be.visible");
    cy.get('button[title="Excluir pergunta"]').first().click();
    cy.get("#room-password").type("12345");
    cy.contains("button", "Confirmar").click();
    cy.contains("Pergunta para excluir").should("not.exist");

    cy.contains("button", "Excluir sala").click();
    cy.get("#room-password").type("12345");
    cy.contains("button", "Confirmar").click();
    cy.location("pathname").should("eq", "/home");
  });
});
