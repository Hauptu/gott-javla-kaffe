# Awin-granskning: Ginza + SharkNinja

Det här underlaget är en **manuell granskningskö**, inte en import till den publicerade produktkatalogen.

## Så använder du granskningsfilen

Öppna `awin-review-queue.csv` i Excel. Fältet **Befintlig EAN-match** flaggar kandidater vars EAN förekommer i nuvarande `products.json` eller `grinders.json`. Börja med dessa och kontrollera om de redan finns som produkt. En EAN-match är en signal att granska – inte ett automatiskt beslut om att lägga till eller avvisa en affiliatebutik.

För varje kandidat:
1. Kontrollera produktsidan och att det är en kaffeprodukt som passar sajten.
2. Kontrollera att namn, varumärke, modell och EAN faktiskt hör ihop.
3. Öppna bildlänken och kontrollera att den visar rätt produkt och går att använda.
4. Kontrollera affiliate-länken. Att den finns i feeden bevisar inte att spårning eller landning fungerar.
5. Sätt beslut manuellt: **godkänn**, **avvisa**, eller **kontrollera vidare**. Godkänn inte enbart på grund av en EAN-match eller en bildlänk.

## Omfattning och kontroller

- Kandidater: 118
- Ginza: 108
- SharkNinja: 10
- Kandidater med EAN som matchar nuvarande katalog: 45
- Alla kandidater har EAN, affiliate-länk, produktsida och bildlänk i kvalitetsrapporten; varumärkesfältet saknas för en kandidat.
- Inga kandidater läggs till i livekatalogen av den här granskningsfilen.

## Nästa steg efter granskning

Först när produkter har godkänts ska de mappas till sajtens befintliga schema. Då behöver vi avgöra om varje post ska bli en ny produkt eller bara ett nytt `affiliate_offers`-erbjudande för en produkt som redan finns. Publicera inte hela granskningskön som en publik produktsida.
