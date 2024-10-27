document.getElementById('downloadBtn').addEventListener('click', function (e) {
    e.preventDefault();

    var element = document.getElementById('contentToDownload');

    element.style.display = 'block'; 

    html2canvas(element).then(function (canvas) {
        var imgData = canvas.toDataURL('image/png');

        element.style.display = 'none'; 

        const { jsPDF } = window.jspdf; 
        var pdf = new jsPDF();

        var imgWidth = 490;
        var imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save('label-download.pdf');
    }).catch(function (error) {
        console.error('Error generating PDF:', error);
    });
});
