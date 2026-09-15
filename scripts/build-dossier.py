from pathlib import Path
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "dossier-trouve-ton-artisan.pdf"
SCREENSHOTS = ROOT / "docs" / "screenshots"
LOGO = ROOT / "public" / "images" / "logo-brief.png"

BLUE = colors.HexColor("#0074C7")
DARK = colors.HexColor("#384050")
NAVY = colors.HexColor("#00497C")
PALE = colors.HexColor("#F1F8FC")
GREEN = colors.HexColor("#82B864")
RED = colors.HexColor("#CD2C2E")


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#D6E3EC"))
    canvas.line(doc.leftMargin, A4[1] - 16 * mm, A4[0] - doc.rightMargin, A4[1] - 16 * mm)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(DARK)
    canvas.drawString(doc.leftMargin, A4[1] - 12 * mm, "Trouve ton artisan")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(A4[0] - doc.rightMargin, 9 * mm, f"Page {doc.page}")
    canvas.setStrokeColor(colors.HexColor("#D6E3EC"))
    canvas.line(doc.leftMargin, 14 * mm, A4[0] - doc.rightMargin, 14 * mm)
    canvas.restoreState()


def header_footer_landscape(canvas, doc):
    w, h = landscape(A4)
    canvas.saveState()
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(DARK)
    canvas.drawString(doc.leftMargin, h - 11 * mm, "Trouve ton artisan - captures responsive")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(w - doc.rightMargin, 8 * mm, f"Page {doc.page}")
    canvas.restoreState()


styles = getSampleStyleSheet()
styles.add(ParagraphStyle("CoverTitle", parent=styles["Title"], fontSize=26, leading=32, alignment=TA_CENTER, textColor=NAVY, spaceAfter=12))
styles.add(ParagraphStyle("Subtitle", parent=styles["Normal"], fontSize=12, leading=17, alignment=TA_CENTER, textColor=DARK))
styles.add(ParagraphStyle("H1x", parent=styles["Heading1"], fontSize=17, leading=22, textColor=NAVY, spaceBefore=10, spaceAfter=8))
styles.add(ParagraphStyle("H2x", parent=styles["Heading2"], fontSize=13, leading=17, textColor=BLUE, spaceBefore=8, spaceAfter=5))
styles.add(ParagraphStyle("Bodyx", parent=styles["BodyText"], fontSize=9.2, leading=13, textColor=DARK, spaceAfter=6))
styles.add(ParagraphStyle("Smallx", parent=styles["BodyText"], fontSize=7.5, leading=10, textColor=DARK))
styles.add(ParagraphStyle("Captionx", parent=styles["BodyText"], fontSize=7, leading=9, textColor=colors.HexColor("#667085"), alignment=TA_CENTER))


def p(text, style="Bodyx"):
    return Paragraph(text, styles[style])


def table(rows, widths=None):
    t = Table(rows, colWidths=widths, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("LEADING", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CAD8E4")),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def screenshot(name, width_mm, max_height_mm=150):
    img_path = SCREENSHOTS / name
    img = Image(str(img_path))
    ratio = img.imageHeight / img.imageWidth
    img.drawWidth = width_mm * mm
    img.drawHeight = img.drawWidth * ratio
    if img.drawHeight > max_height_mm * mm:
        img.drawHeight = max_height_mm * mm
        img.drawWidth = img.drawHeight / ratio
    return img


def make_doc():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=22 * mm, bottomMargin=18 * mm)
    portrait = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height - 3 * mm, id="portrait")
    doc.addPageTemplates([
        PageTemplate(id="portrait", frames=[portrait], onPage=header_footer),
        PageTemplate(
            id="landscape",
            pagesize=landscape(A4),
            frames=[Frame(14 * mm, 14 * mm, landscape(A4)[0] - 28 * mm, landscape(A4)[1] - 28 * mm, id="landscape")],
            onPage=header_footer_landscape,
        ),
    ])

    story = []
    logo = Image(str(LOGO))
    logo.drawWidth = 120 * mm
    logo.drawHeight = 31 * mm
    story += [Spacer(1, 22 * mm), logo, Spacer(1, 22 * mm)]
    story += [
        p('Dossier de projet - Site Web "Trouve ton artisan"', "CoverTitle"),
        p("Devoir bilan React.JS, Express et MySQL", "Subtitle"),
        Spacer(1, 8 * mm),
        p(f"Projet realise le {date.today().strftime('%d/%m/%Y')} pour la Region Auvergne-Rhone-Alpes.", "Subtitle"),
        Spacer(1, 12 * mm),
        p("Auteur: Charly Offry", "Subtitle"),
        p("Depot GitHub: https://github.com/charlyoff/trouve-ton-artisan", "Subtitle"),
        p("Lien du site en ligne: a renseigner apres choix de l'hebergement Node + MySQL.", "Subtitle"),
        PageBreak(),
    ]

    story += [p("Sommaire", "H1x")]
    for item in [
        "1. Contexte du projet et besoin",
        "2. Contraintes et livrables attendus",
        "3. Solution technique retenue",
        "4. Base de donnees: MCD, MLD et SQL",
        "5. Securite et accessibilite",
        "6. Tests et validation",
        "7. Maquettes et captures responsive",
        "8. Veille securite et suites a prevoir",
    ]:
        story.append(p(item))
    story.append(PageBreak())

    story += [p("1. Contexte du projet", "H1x")]
    story.append(p("La Region Auvergne-Rhone-Alpes souhaite proposer un site vitrine permettant aux particuliers de trouver facilement un artisan local par categorie, specialite, ville ou nom. L'application s'appuie sur les donnees fournies dans le tableur du devoir et respecte la charte graphique imposee."))
    story.append(p("Le besoin utilisateur principal est simple: comprendre le fonctionnement du service, consulter les categories, rechercher un artisan, lire sa fiche et envoyer une demande de contact."))

    story += [p("2. Contraintes et livrables", "H1x")]
    story.append(table([
        ["Element", "Reponse apportee"],
        ["Frontend", "React, React Router, Bootstrap 5, Sass, responsive mobile/tablette/desktop."],
        ["Backend", "API REST Express separee derriere une passerelle publique."],
        ["Base", "MySQL avec schema relationnel, cles et contraintes; scripts schema.sql et seed.sql."],
        ["Donnees", "17 artisans, 15 specialites, 4 categories et 3 artisans mis en avant extraits du tableur."],
        ["Design", "Palette et assets fournis, logo recupere depuis le brief pour eviter la perte de masque du PNG fourni."],
        ["Livrables", "Code, scripts SQL, README, captures, dossier PDF, lien Figma existant et procedure de deploiement."],
    ], [35 * mm, 125 * mm]))

    story += [p("3. Solution technique", "H1x")]
    story.append(table([
        ["Couche", "Role", "Choix"],
        ["React", "Interface utilisateur", "Composants reutilisables, routes SPA et etats de chargement/erreur."],
        ["Express gateway", "Point d'entree public", "Session CSRF, controle d'origine, limite de debit et proxy vers API privee."],
        ["Express API", "Acces metier", "Lecture categories/artisans, validation Zod, contact par email."],
        ["MySQL", "Persistance", "Tables categories, specialites, artisans avec relations et contraintes."],
    ], [32 * mm, 44 * mm, 84 * mm]))

    story += [p("4. Base de donnees", "H1x")]
    story.append(p("MCD simplifie: une categorie possede plusieurs specialites; une specialite possede plusieurs artisans; une ville peut etre associee a plusieurs artisans. Cette entite Ville evite de repeter le meme libelle dans chaque artisan et respecte mieux les formes normales."))
    story.append(table([
        ["Entite", "Attributs principaux", "Relations"],
        ["Category", "id, name, slug", "1,n avec Specialty"],
        ["Specialty", "id, name, category_id", "n,1 avec Category; 1,n avec Artisan"],
        ["City", "id, name", "1,n avec Artisan"],
        ["Artisan", "id, name, rating, about, email, website, is_top, specialty_id, city_id", "n,1 avec Specialty; n,1 avec City"],
    ], [28 * mm, 82 * mm, 50 * mm]))
    story.append(p("MLD: categories(id PK, name UNIQUE, slug UNIQUE), specialties(id PK, name UNIQUE, category_id FK), cities(id PK, name UNIQUE), artisans(id PK, rating CHECK 0..5, specialty_id FK, city_id FK). Les suppressions en cascade ne sont pas activees pour eviter les pertes accidentelles."))
    story.append(Preformatted("database/schema.sql\n  creation des 3 tables et contraintes\ndatabase/seed.sql\n  insertion des donnees du tableur fourni", styles["Smallx"]))

    story += [p("5. Securite et accessibilite", "H1x")]
    story.append(table([
        ["Risque", "Mesure mise en place"],
        ["Injection SQL", "Sequelize avec parametres; recherche par INSTR pour traiter %, _ et guillemets comme texte."],
        ["Abus formulaire", "Validation stricte Zod, honeypot, consentement obligatoire, taille limitee et rate limiting."],
        ["CSRF", "Jeton signe + cookie HttpOnly SameSite Strict + controle d'origine."],
        ["Exposition email", "L'email artisan n'est jamais retourne au navigateur; l'API le recupere cote serveur."],
        ["Compte base", "Compte runtime en lecture seule, verifie par test d'integration."],
        ["Accessibilite", "Navigation clavier, contrastes verifies, attributs ARIA utiles et audits axe-core WCAG 2.1 A/AA."],
    ], [43 * mm, 117 * mm]))

    story += [p("6. Tests et validation", "H1x")]
    story.append(table([
        ["Commande", "Validation"],
        ["npm run test", "Schemas de validation et entrees hostiles; tests unitaires passes."],
        ["npm run test:db", "Volumes importes et droit lecture seule; tests passes sur MySQL local."],
        ["npm run build", "Compilation Vite production passee."],
        ["npm run test:e2e", "Parcours principaux, contact preview, protections API, absence d'ID duplique, hierarchie de titres et audits axe-core en 390/768/1440 px."],
        ["npm run audit:prod", "Audit npm de production sans vulnerabilite connue au moment du test."],
    ], [42 * mm, 118 * mm]))

    story += [p("7. Captures", "H1x")]
    story.append(p("Lien vers les maquettes Figma fournies: https://www.figma.com/design/SXHK2YK4DRDDyRr97nqEby/Trouve-ton-artisan---Maquettes?node-id=0-1. Les captures ci-dessous proviennent du site final rendu localement et couvrent les vues demandees; elles servent de preuves de rendu responsive."))
    story.append(NextPageTemplate("landscape"))
    story.append(PageBreak())

    captures = [
        ("Accueil desktop", "accueil-1440.png", 172),
        ("Accueil mobile", "accueil-390.png", 56),
        ("Categorie desktop", "categorie-1440.png", 172),
        ("Fiche artisan mobile", "fiche-390.png", 56),
        ("Recherche tablette", "recherche-768.png", 118),
        ("Page 404 desktop", "404-1440.png", 172),
    ]
    for idx, (title, filename, width) in enumerate(captures):
        story.append(KeepTogether([p(title, "H2x"), screenshot(filename, width), p(filename, "Captionx")]))
        if idx in {1, 3}:
            story.append(PageBreak())

    story.append(NextPageTemplate("portrait"))
    story.append(PageBreak())
    story += [p("8. Veille securite et suites", "H1x")]
    story.append(p("Une veille a ete effectuee sur Express, Sequelize, WCAG et les avis de securite npm. L'audit npm a initialement signale une dependance transitive vulnerable de uuid; le projet force maintenant uuid 11.1.1 via overrides, et npm audit --omit=dev revient sans alerte."))
    story.append(p("Points a finaliser avant rendu public: choisir un hebergement compatible Node + MySQL, configurer un SMTP reel et renseigner l'URL du site en ligne dans ce dossier. Le depot GitHub public est cree: https://github.com/charlyoff/trouve-ton-artisan."))
    story.append(p("La police Graphik est demandee par le brief. Faute de licence web redistribuable fournie, le CSS utilise Graphik si elle est installee localement puis Inter en fallback libre. Cette decision evite d'inclure illegalement des fichiers de police dans le depot."))

    doc.build(story)
    return OUT


if __name__ == "__main__":
    print(make_doc())
