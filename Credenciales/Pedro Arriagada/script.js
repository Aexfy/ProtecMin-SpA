document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('download-vcard');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            // 1. Datos del contacto actualizados
            const contact = {
                firstName: "Pedro",
                lastName: "Arriagada",
                company: "ProtecMin",
                title: "Socio Director",       // Puedes actualizar el cargo si lo deseas
                phone: "+56996363153",         // Reemplaza con tu número real
                email: "parriagada@protecminspa.cl",  // Reemplaza con tu correo real
                website: "www.protecminspa.cl"
            };

            // 2. Estructura del archivo VCF (VCard)
            // El campo "N:" es el que separa Apellido ; Nombre
            // El campo "FN:" es el nombre completo para mostrar
            // El campo "ORG:" es la empresa
            const vcardData = `BEGIN:VCARD
VERSION:3.0
N:${contact.lastName};${contact.firstName};;;
FN:${contact.firstName} ${contact.lastName}
ORG:${contact.company}
TITLE:${contact.title}
TEL;TYPE=WORK,VOICE:${contact.phone}
EMAIL;TYPE=PREF,INTERNET:${contact.email}
URL:${contact.website}
END:VCARD`;

            // 3. Lógica para forzar la descarga en el teléfono
            // Se usa utf-8 para que no haya problemas con los caracteres
            const blob = new Blob([vcardData], { type: "text/vcard;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = "contacto_pedro_arriagada.vcf"; // Nombre del archivo que se descarga
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }
});