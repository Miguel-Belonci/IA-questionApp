describe('authenticated navigation', () => {
  it('redirects logged users away from auth pages', () => {
    cy.registerByApi().then(({ token }) => {
      cy.visitAs('/register', token);
      cy.location('pathname').should('eq', '/home');

      cy.visitAs('/', token);
      cy.location('pathname').should('eq', '/home');
    });
  });

  it('registers and logs in through the interface', () => {
    const email = `ui-auth-${Date.now()}@example.com`;

    cy.visit('/register');
    cy.contains('h1', 'Criar conta').should('be.visible');
    cy.contains('label', 'Nome').find('input').type('Usuario UI');
    cy.contains('label', 'Email').find('input').type(email);
    cy.contains('label', 'Senha').find('input').type('123456');
    cy.contains('button', 'Criar conta').click();
    cy.location('pathname').should('eq', '/home');

    cy.get('button[title="Abrir menu"]').click();
    cy.contains('button', 'Sair').click();
    cy.location('pathname').should('eq', '/');

    cy.contains('label', 'Email').find('input').type(email);
    cy.contains('label', 'Senha').find('input').type('123456');
    cy.contains('button', 'Entrar').click();
    cy.location('pathname').should('eq', '/home');
  });
});
