let gebruikersKeuzes = {
    risicoKlasse: null,
    hbvStatus: null,
    hbvBronUitslag: null,
    hbvBronRisicogroep: null,
    hcvBron: null,
    hivBron: null
};

function verwerkStap1() {
    const select = document.getElementById("incident-select");
    const klasse = select.value;
    gebruikersKeuzes.risicoKlasse = klasse;

    // FIX: Voeg de petrol styling toe aan de dropdown omdat er een keuze is gemaakt
    select.classList.add("gekozen-dropdown");

    let conclusieTekst = "";
    if (klasse === "1") conclusieTekst = "Er is bij dit incident GEEN risico op overdracht van bloedoverdraagbare aandoeningen.";
    else if (klasse === "2") conclusieTekst = "Er is bij dit incident ALLEEN een LAAG risico op Hepatitis B (HBV).";
    else if (klasse === "3") conclusieTekst = "Er is bij dit incident een HOOG risico op Hepatitis B (HBV), en een laag risico op Hepatitis C (HCV) én HIV.";

    document.getElementById("feedback-tekst-1").innerText = conclusieTekst;
    document.getElementById("feedback-1").style.display = 'block';

    verbergVanafStap();
    bepaalVolgendeStap();
}

function kiesVervolg(variabele, waarde, sectieNaam, feedbackTekst) {
    gebruikersKeuzes[variabele] = waarde;
    document.getElementById(`feedback-tekst-${sectieNaam}`).innerText = feedbackTekst;
    document.getElementById(`feedback-${sectieNaam}`).style.display = 'block';

    // Kleurt de gekozen knop solide Petrol en maakt de andere vaag-petrol met ZWARTE tekst
    const knoppen = document.querySelectorAll(`#sectie-${sectieNaam} button`);
    knoppen.forEach(knop => {
        if (!knop.getAttribute('onclick').includes(`'${waarde}'`)) {
            knop.style.opacity = "0.35"; // Vagere look voor niet-gekozen antwoorden
            knop.style.backgroundColor = "#ffffff"; 
            knop.style.color = "#111111";           // FIX: Ongekozen tekst blijft/wordt strak zwart
            knop.style.borderColor = "#008A8F";     
        } else {
            knop.style.opacity = "1"; // Gekozen knop is 100% zichtbaar
            knop.style.backgroundColor = "#008A8F"; // Solide petrol achtergrond
            knop.style.color = "#ffffff";           // Witte tekst voor optimaal contrast
            knop.style.borderColor = "#008A8F";     
        }
    });

    bepaalVolgendeStap();
}

function bepaalVolgendeStap() {
    const k = gebruikersKeuzes;
    document.getElementById("vervolg-stappen").classList.remove("verborgen");

    if (k.risicoKlasse === "1") {
        document.getElementById("btn-bereken").classList.remove("verborgen");
        return;
    }
    
    if (k.risicoKlasse === "2" || k.risicoKlasse === "3") {
        document.getElementById("sectie-hbv").classList.remove("verborgen");
    }

    if (k.hbvStatus === "niet-gevaccineerd") {
        document.getElementById("sectie-hbv-bron").classList.remove("verborgen");
        if (k.risicoKlasse === "2") {
            document.getElementById("vragen-hbv-bron-laag").classList.remove("verborgen");
            document.getElementById("vragen-hbv-bron-hoog").classList.add("verborgen");
        } else {
            document.getElementById("vragen-hbv-bron-hoog").classList.remove("verborgen");
            document.getElementById("vragen-hbv-bron-laag").classList.add("verborgen");
        }
    } else {
        document.getElementById("sectie-hbv-bron").classList.add("verborgen");
        k.hbvBronUitslag = null;
    }

    if (k.risicoKlasse === "3" && k.hbvStatus === "niet-gevaccineerd" && k.hbvBronUitslag === "onbekend") {
        document.getElementById("sectie-hbv-bron-risico").classList.remove("verborgen");
    } else {
        document.getElementById("sectie-hbv-bron-risico").classList.add("verborgen");
        if (k.hbvBronUitslag !== "onbekend") k.hbvBronRisicogroep = null;
    }

    if (k.risicoKlasse === "2") {
        if (k.hbvStatus === "gevaccineerd" || (k.hbvStatus === "niet-gevaccineerd" && k.hbvBronUitslag !== null)) {
            document.getElementById("btn-bereken").classList.remove("verborgen");
        }
    } 
    else if (k.risicoKlasse === "3") {
        let hbvKlaar = (k.hbvStatus === "gevaccineerd") || 
                       (k.hbvStatus === "niet-gevaccineerd" && (k.hbvBronUitslag === "negatief" || k.hbvBronUitslag === "positief")) ||
                       (k.hbvBronUitslag === "onbekend" && k.hbvBronRisicogroep !== null);
        
        if (hbvKlaar) {
            document.getElementById("sectie-hcv").classList.remove("verborgen");
        }
        if (k.hcvBron !== null) {
            document.getElementById("sectie-hiv").classList.remove("verborgen");
        }
        if (k.hivBron !== null) {
            document.getElementById("btn-bereken").classList.remove("verborgen");
        }
    }
}

function toonEindAdvies() {
    const resultaatDiv = document.getElementById('stap-resultaat');
    const adviesTekst = document.getElementById('advies-tekst');
    const k = gebruikersKeuzes;
    
    let titel = "";
    let tekst = "";

    if (k.risicoKlasse === "1") {
        titel = "Geen Risico";
        tekst = "Er is op basis van dit incident geen risico op HBV, HCV of HIV. Er is geen verdere medische opvolging vereist.";
    }
    else if (k.risicoKlasse === "2") {
        titel = "Laag Risico op HBV";
        if (k.hbvStatus === "gevaccineerd") {
            tekst = "Je bent gevaccineerd en dus beschermd tegen HBV. Er is geen risico op HCV/HIV. Geen actie vereist.";
        } else if (k.hbvBronUitslag === "negatief") {
            tekst = "Je bent zelf niet beschermd, maar de bron is HBV-negatief getest. Er is momenteel geen risico op overdracht. Overweeg wel vaccinatie voor de toekomst.";
        } else {
            tekst = "<strong>Beleid Laag Risico:</strong> Niet beschermd en bron positief/onbekend. Neem binnen 24 uur contact op met een arts voor (booster)vaccinatie.";
        }
    }
    else if (k.risicoKlasse === "3") {
        titel = "Hoog Risico op HBV, HCV en HIV";
        let subTekst = "Dit betreft een hoog risico accident. Dit zijn de actiepunten:<br><ul>";
        
        if (k.hbvStatus === "gevaccineerd") {
            subTekst += "<li><strong>HBV:</strong> Gevaccineerd en beschermd. Geen actie nodig.</li>";
        } else if (k.hbvBronUitslag === "negatief") {
            subTekst += "<li><strong>HBV:</strong> Niet beschermd, maar de bron is HBV-negatief. Geen acute noodbehandeling nodig.</li>";
        } else if (k.hbvBronUitslag === "positief") {
            subTekst += "<li><strong>HBV DIRECTE SPOED:</strong> Niet beschermd en bron bekend HBV-positief! Dien <strong>binnen 24 uur</strong> HBIG (immunoglobulines) én een vaccinatie toe via een arts.</li>";
        } else if (k.hbvBronUitslag === "onbekend") {
            if (k.hbvBronRisicogroep === "ja") {
                subTekst += "<li><strong>HBV DIRECTE SPOED:</strong> Niet beschermd en bron is onbekend maar behoort tot een **hoog-risicogroep**. Behandel als positief: dien <strong>binnen 24 uur</strong> HBIG en vaccinatie toe.</li>";
            } else {
                subTekst += "<li><strong>HBV SPOED:</strong> Niet beschermd en bron is onbekend (geen hoog-risicogroep). Start <strong>binnen 24 uur</strong> met een versneld vaccinatieschema.</li>";
            }
        }
        
        if (k.hcvBron === "negatief") subTekst += "<li><strong>HCV:</strong> Bron is HCV-negatief, geen specifieke opvolging nodig.</li>";
        else subTekst += "<li><strong>HCV Opvolging:</strong> Risico aanwezig. Bloedcontrole na 0 en 3 maanden via arts is noodzakelijk.</li>";
        
        if (k.hivBron === "laag-risico") subTekst += "<li><strong>HIV:</strong> Risico is verwaarloosbaar laag. Geen PEP nodig.</li>";
        else subTekst += "<li><strong>HIV DIRECTE SPOED:</strong> Reëel risico op HIV! Neem <strong>direct (binnen max 72 uur)</strong> contact op met de GGD of SEH voor een PEP-noodbehandeling.</li>";
        
        subTekst += "</ul>";
        tekst = subTekst;
    }

    adviesTekst.innerHTML = `<h3>Uitkomst: ${titel}</h3><p>${tekst}</p>`;
    resultaatDiv.classList.remove('verborgen');
    resultaatDiv.scrollIntoView({ behavior: 'smooth' });
}


function verbergVanafStap() {
    document.getElementById("btn-bereken").classList.add("verborgen");
    document.getElementById("stap-resultaat").classList.add("verborgen");
    const secties = ["hbv", "hbv-bron", "hbv-bron-risico", "hcv", "hiv"];
    
    secties.forEach(s => {
        document.getElementById(`sectie-${s}`).classList.add("verborgen");
        document.getElementById(`feedback-${s}`).style.display = "none";
        
        const knoppen = document.querySelectorAll(`#sectie-${s} button`);
        knoppen.forEach(k => { 
            k.style.opacity = "1"; 
            k.style.backgroundColor = "#ffffff"; 
            k.style.color = "#111111";           // FIX: Herstelt de tekstkleur keihard naar strak zwart
            k.style.borderColor = "#008A8F";     // Herstelt de border naar petrol
        });
    });
    
    document.getElementById("vragen-hbv-bron-laag").classList.add("verborgen");
    document.getElementById("vragen-hbv-bron-hoog").classList.add("verborgen");
    
    gebruikersKeuzes.hbvStatus = null;
    gebruikersKeuzes.hbvBronUitslag = null;
    gebruikersKeuzes.hbvBronRisicogroep = null;
    gebruikersKeuzes.hcvBron = null;
    gebruikersKeuzes.hivBron = null;
}

function resetTool() {
    const select = document.getElementById("incident-select");
    select.selectedIndex = 0;
    
    // FIX: Verwijder de petrol styling van de dropdown zodat hij weer wit/groen wordt bij een reset
    select.classList.remove("gekozen-dropdown");
    
    document.getElementById("feedback-1").style.display = "none";
    document.getElementById("vervolg-stappen").classList.add("verborgen");
    verbergVanafStap();
}