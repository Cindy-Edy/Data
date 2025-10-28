const IsiBukuTamu = () => {
    let nama = prompt('Masukan Nama Anda');
    let alamat = prompt('Masukan Alamat Anda');
    let ucapan = prompt('Masukan Ucapan Anda');

        let tbody = document.getElementById('tbody');
        let totalData = tbody.childElementCount;

    tbody.innerHTML += `
    <tr>
        <td>${totalData + 1}</td>
        <td>${nama}</td>
        <td>${alamat}</td>
        <td>${ucapan}</td>
    </tr>
`;
}