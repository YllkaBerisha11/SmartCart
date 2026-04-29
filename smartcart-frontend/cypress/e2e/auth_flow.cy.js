describe('SmartCart Auth Flow', () => {
  it('Skenari: Regjistrimi i suksesshëm', () => {
    cy.visit('/register');
    
    // Plotësojmë fushat
    cy.get('input').eq(0).type('Test User', { force: true });
    
    // Përdorim email unik që të mos kemi gabime "Email exists"
    const email = `test${Date.now()}@gmail.com`;
    cy.get('input').eq(1).type(email, { force: true });
    
    cy.get('input[type="password"]').type('Pass123!', { force: true });

    // ZGJIDHJA: Përdorim Regex që të injorojmë shigjetën "→"
    cy.contains('button', /CREATE ACCOUNT/i).click({ force: true });

    // Verifikimi që jemi ridrejtuar te Login
    cy.url({ timeout: 10000 }).should('include', '/login');
  });
});