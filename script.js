const circuitName = "ads_mem";

function loadFile() {
    const input = document.getElementById("memFile");

    // Verifica se o arquivo foi selecionado
    const file = input.files[0] || null;
    if(!file){
        window.alert("Nenhum arquivo selecionado, por favor selecione um arquivo.");
        return;
    }
    // Verifica se o arquivo tem o tamanho correto
    if(file.size !== 516){
        window.alert("O arquivo selecionado não tem o tamanho correto, por favor selecione um arquivo exportado do simulador NEANDER.");
        return;
    }

    const reader = new FileReader();
    reader.onload = e => handleFile(e.target.result);
    reader.readAsArrayBuffer(file);    
}

function handleFile(buffer) {
    const memTable = document.getElementById("memTable");
    const vhdlResult = document.getElementById("vhdlResult");
    
    // Limpa a tabela e o resultado anterior
    memTable.innerHTML = vhdlResult.innerHTML = "";
    
    // Converte o buffer para um array de bytes, remove os 4 primeiros bytes e filtra os bytes pares
    const bytes = new Uint8Array(buffer).slice(4).filter((_, i ) => i % 2 === 0);
    
    // Cria a tabela de memória
    let table = "";
    for(let i = 0; i < bytes.length; i++){                
        table += `<tr><td>${i.toString(16).toUpperCase()}</td><td>${bytes[i].toString(16).toUpperCase()}</td></tr>`;
    }
    memTable.innerHTML = table;

    // Converte os bytes para VHDL
    vhdlResult.innerHTML = convertToVHDL(circuitName, bytes);
}


function convertToVHDL(name, bytes) {
    let cases = "";
    // Cria os cases para o VHDL, pulando os bytes com valor 0
    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] !== 0 || i === 0) {
            cases += `        x"${bytes[i].toString(16).padStart(2, '0').toUpperCase()}" WHEN x"${i.toString(16).padStart(2, '0').toUpperCase()}",\n  `;
        }
    }
    return `library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

ENTITY ${name} IS 
    PORT(
        address: IN STD_LOGIC_VECTOR (7 DOWNTO 0);
        content: OUT STD_LOGIC_VECTOR (7 DOWNTO 0)
    );
END ${name};

ARCHITECTURE circ1 OF ${name} IS
BEGIN
    WITH address SELECT
        content <= 
${cases}
        x"00" WHEN OTHERS;
END circ1;
`;
}
