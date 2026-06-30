---
title: Power BI
sidebar_label: Power BI
description: Power BI koppelen aan Yres — verbindingseisen.
---

# Power BI

**Categorie:** Directe koppeling

Het brontype **PowerBI** registreert een Power BI-tenant in Yres via een Azure AD
service principal. Anders dan de meeste bronnen kopieert Yres hier **geen tabellen**: er
wordt geen ADF-pipeline of linked service voor aangemaakt en er is geen metadata-fase.
De koppeling wordt gebruikt om de **workspaces en (unified) modellen** van de tenant op
te halen en die modellen tijdens loads (via de Master pipeline) te **verversen**.

De geregistreerde tenant verschijnt vervolgens op de pagina **PowerBI Models**, waar je
per Yres-omgeving het juiste model koppelt dat bij een actie wordt aangeroepen.

:::note Ingebed dashboard ≠ dit brontype
Het **ingebedde dashboard** in de Yres-webapp (admin-tab *PowerBI Dashboard*) staat los van dit
brontype. Dat dashboard wordt geconfigureerd met de instellingen `BiDashboardUrl` (de embed-URL van een
Power BI-rapport) en `BiDashboardHeight` (hoogte), niet via deze bronkoppeling.
:::

## Verwachte input

Je vult bij het toevoegen van de bron (wizard *Bron toevoegen*) de gedeelde velden in
(o.a. **Bronnaam**, **type**, **integration runtime**, geldigheid van de credentials) plus
de volgende Power BI-specifieke velden:

| Veld | Beschrijving |
|---|---|
| **Tenant Id** | De Directory (tenant) ID van je Microsoft Entra-tenant. |
| **Client Id** | De Application (client) ID van de geregistreerde Azure AD-app. |
| **Client secret** | Het client secret van diezelfde app. |

- **Authenticatie:** Azure AD-app (**service principal**) — Tenant Id, Client Id en Client
  secret samen.
- **Integration runtime:** voor dit brontype wordt geen ADF-kopieerproces uitgevoerd en
  geen linked service aangemaakt; de tenant wordt rechtstreeks via de **Power BI API**
  benaderd. Een self-hosted integration runtime is hier niet nodig.

:::note Geen integration-runtime-keuze
Het PowerBI-bronformulier toont **geen** integration-runtime-keuze (alleen Tenant Id, Client Id en Client
Secret). Functioneel is de runtime ook niet van toepassing, omdat er geen ADF-copy plaatsvindt.
:::

## Vereisten

- **App-registratie** — Registreer in Microsoft Entra ID (Azure portal) → **App
  registrations** een nieuwe applicatie. Op het *Overview*-tabblad vind je de **Directory
  (tenant) ID** en de **Application (client) ID**.
- **Client secret** — Maak onder **Certificates & secrets** → *New client secret* een
  geheim aan en kopieer de waarde direct (deze is maar één keer zichtbaar).
- **Service-principal-toegang inschakelen** — In de **Power BI Admin portal** → *Tenant
  settings* → *Developer settings* schakel je *Service principals can use Fabric/Power BI
  APIs* in (eventueel beperkt tot een securitygroep waarin de app zit).
- **App aan workspace toevoegen** — Voeg de service principal als *Member* of *Admin* toe
  aan de betreffende Power BI-workspace(s), zodat Yres de workspaces en modellen kan
  ophalen en verversen.

## Hoe Yres de credentials opslaat

De drie ingevulde waarden worden niet door de frontend bewaard, maar opgeslagen als
secrets in de **Azure Key Vault** van de klant, onder de namen:

- `adf-{bronnaam}-tenantId`
- `adf-{bronnaam}-clientId`
- `adf-{bronnaam}-clientSecret`

Hierbij is `{bronnaam}` de naam die je bij **Bronnaam** hebt opgegeven.

## Let op

- **Geen metadata en geen tabellen.** PowerBI is een "file source" zonder metadata: er is
  géén metadata-ophaalstap en je voegt geen tabellen/load types toe zoals bij een database
  of bestandsbron. De koppeling dient uitsluitend om modellen van de tenant te kunnen
  verversen.
- **Modellen koppelen.** Na het aanmaken van de bron verschijnt de tenant op **PowerBI
  Models**; koppel daar per omgeving het juiste model.

Officiële docs: [Embed Power BI content with service principal and an application secret (Microsoft Learn)](https://learn.microsoft.com/en-us/power-bi/developer/embedded/embed-service-principal).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
