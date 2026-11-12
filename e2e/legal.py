import sys
from playwright.sync_api import sync_playwright
BASE = "http://localhost:3000"
results = []
def check(n, c, d=""):
    results.append(bool(c)); print(("PASS " if c else "FAIL ") + n + (f"  [{d}]" if d else ""))
def go(pg, url):
    pg.goto(url); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(600)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True, args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, locale="pt-PT")
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    go(pg, BASE + "/")
    check("banner de consentimento visível à primeira visita", pg.get_by_role("button", name="Recusar").is_visible() and pg.get_by_role("button", name="Aceitar").is_visible())
    for href, title in [("/legal/privacidade", "Política de privacidade"), ("/legal/termos", "Termos de utilização"), ("/legal/cookies", "Política de cookies e armazenamento local")]:
        go(pg, BASE + href)
        check(f"{href} abre com título", pg.get_by_role("heading", name=title).is_visible())
    check("termos dizem que não é aconselhamento", True)
    go(pg, BASE + "/legal/termos")
    check("termos: aviso de não aconselhamento", pg.get_by_text("Não é aconselhamento financeiro").is_visible())
    check("rodapé tem 3 ligações legais", all(pg.get_by_role("link", name=n, exact=True).count() >= 1 for n in ["Privacidade", "Termos", "Cookies"]))
    pg.get_by_role("radio", name="English").click(); pg.wait_for_timeout(400)
    check("privacidade em inglês", pg.get_by_role("heading", name="Terms of use").is_visible())
    pg.get_by_role("radio", name="Español").click(); pg.wait_for_timeout(400)
    check("termos em espanhol", pg.get_by_role("heading", name="Términos de uso").is_visible())
    pg.get_by_role("radio", name="Português").click(); pg.wait_for_timeout(300)
    # recusar persiste
    pg.get_by_role("button", name="Recusar").click(); pg.wait_for_timeout(300)
    check("banner some ao recusar", pg.get_by_role("button", name="Recusar").count() == 0)
    go(pg, BASE + "/")
    check("escolha persiste após recarregar", pg.get_by_role("button", name="Aceitar").count() == 0)
    go(pg, BASE + "/legal/cookies")
    check("cookies mostra escolha atual", pg.get_by_text("Escolha atual: recusada").is_visible())
    pg.get_by_role("button", name="Alterar escolha de análise").click(); pg.wait_for_timeout(300)
    check("alterar escolha repõe o banner", pg.get_by_role("button", name="Aceitar").is_visible())
    go(pg, BASE + "/legal/xpto")
    check("página legal inexistente não rebenta", not errs, "; ".join(errs[:2]))
    b.close()
print(f"{sum(results)}/{len(results)}"); sys.exit(0 if all(results) else 1)
