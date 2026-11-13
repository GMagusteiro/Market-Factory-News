import sys
from playwright.sync_api import sync_playwright
BASE = "http://localhost:3000"
PT_STATE = {"cookies": [], "origins": [{"origin": BASE, "localStorage": [{"name": "marketlens.lang.v1", "value": "pt"}]}]}
results = []
def check(n, c, d=""):
    results.append(bool(c)); print(("PASS " if c else "FAIL ") + n + (f"  [{d}]" if d else ""))
def go(pg, url):
    pg.goto(url); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(600)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True, args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, locale="pt-PT", storage_state=PT_STATE)
    pg = ctx.new_page(); errs = []; posts = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("request", lambda r: posts.append(r.url) if "posthog" in r.url else None)
    go(pg, BASE + "/")
    check("convite de onboarding na página inicial", pg.get_by_text("Começa pelos teus ativos").is_visible())
    pg.get_by_role("button", name="Começar").click(); pg.wait_for_url("**/bem-vindo"); pg.wait_for_timeout(500)
    check("abre o onboarding", pg.get_by_role("heading", name="Bem-vindo ao Market Factory News").is_visible())
    check("passo 2 só depois de escolher interesse", pg.get_by_text("2. Escolhe pelo menos 3 ativos").count() == 0)
    check("sem botão de criar antes de 3 ativos", pg.get_by_role("button", name="Criar a minha watchlist").count() == 0)
    pg.get_by_role("button", name="Ações", exact=True).click(); pg.wait_for_timeout(300)
    check("aparece passo 2", pg.get_by_text("2. Escolhe pelo menos 3 ativos").is_visible())
    check("só ações listadas (sem EUR/USD)", pg.get_by_role("button", name="EUR/USD").count() == 0)
    for sym in ["NVDA", "AAPL"]:
        pg.get_by_role("button", name=sym, exact=True).click()
    pg.wait_for_timeout(200)
    check("com 2 ativos ainda não pode criar", pg.get_by_role("button", name="Criar a minha watchlist").count() == 0)
    pg.get_by_role("button", name="MSFT", exact=True).click(); pg.wait_for_timeout(200)
    check("com 3 ativos pode criar", pg.get_by_role("button", name="Criar a minha watchlist").is_visible())
    pg.get_by_role("button", name="Criar a minha watchlist").click(); pg.wait_for_url("**/watchlist"); pg.wait_for_timeout(800)
    body = pg.locator("body").inner_text()
    check("watchlist tem os 3 ativos", all(n in body for n in ["NVIDIA", "Apple", "Microsoft"]))
    go(pg, BASE + "/")
    check("convite desaparece depois de concluído", pg.get_by_text("Começa pelos teus ativos").count() == 0)
    # dispensar persiste
    ctx2 = b.new_context(viewport={"width": 1280, "height": 900}, locale="pt-PT", storage_state=PT_STATE); pg2 = ctx2.new_page()
    go(pg2, BASE + "/")
    pg2.get_by_role("button", name="Agora não").click(); pg2.wait_for_timeout(300)
    go(pg2, BASE + "/")
    check("dispensar persiste", pg2.get_by_text("Começa pelos teus ativos").count() == 0)
    check("nenhum pedido ao PostHog sem consentimento", not posts, ", ".join(posts[:2]))
    check("sem erros de página", not errs, "; ".join(errs[:2]))
    b.close()
print(f"{sum(results)}/{len(results)}"); sys.exit(0 if all(results) else 1)
