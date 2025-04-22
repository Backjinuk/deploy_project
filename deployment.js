const date = new Date();
const now = date.getFullYear() + ((date.getMonth() + 1).toString().padStart(2, '0') +  (date.getDate().toString().padStart(2, '0')));

//select박스 만들기
async function createBasePathValue(){
    var loadSiteName = await loadData();
    var html = ""

    loadSiteName.forEach(item => {
        html += '<option value='+item['value']+'>'+item['text']+'</option>';
    });

    $(".basePathValue").html(html);
}

// JSON 파일 불러오기
async function loadData() {
    // jsonData는 이제 파싱된 JSON 객체입니다.
    const result = jsonData['siteName'];
    return result;
}

async function getSiteDate(id){
    const result = jsonData['sitePath'][id]['paths'];
    return result
}

async function getHomePath(id){

    const result = jsonData['siteName'][id];
    return result

}


// 데이터 수정
async function saveProject(projectData) {
    var loadSiteName = await loadData();

    var seq = parseInt(loadSiteName[loadSiteName.length - 1]['value'], 10) + 1; // 마지막 데이터의 seq값 가져오기

    jsonData = await setJsonData(seq, jsonData, projectData);
    
    //document.getElementById('jsonData').textContent = JSON.stringify(jsonData, null, 2);

    downloadData(jsonData);
}

async function setJsonData(seq, jsonData, projectData) {

    // 새로운 siteName 객체 생성
    let newSiteName = {
        value: seq,
        text: projectData[0].value, 
        homePath : projectData[1].value
    };

    // siteName 배열에 새로운 객체 추가
    jsonData.siteName.push(newSiteName);

    // 동적으로 sitePath 객체 생성
    jsonData.sitePath[seq] = {
        name: projectData[0].value, // 이 부분은 필요에 따라 수정해야 할 수 있습니다.
        paths: {
            java_old:   addPrefixIfNeeded(projectData[2].value, "java/"),
            java_new:   appendSlashIfNeeded(projectData[3].value, "/"),
            xml_old:    addPrefixIfNeeded(projectData[4].value, "resources/"),
            xml_new:    appendSlashIfNeeded(projectData[5].value, "/"),
            jsp_old:    addPrefixIfNeeded(projectData[6].value, "WEB-INF/"),
            jsp_new:    appendSlashIfNeeded(projectData[7].value, "/"),
            script_old: addPrefixIfNeeded(projectData[8].value, "webapp/"),
            script_new: appendSlashIfNeeded(projectData[9].value, "/")
        }
    };

    return jsonData; // 수정된 jsonData 객체 반환
}

function addPrefixIfNeeded(path, keyword) {
    let index = path.indexOf(keyword);
    if (index !== -1) {
        return path.substring(0, index + keyword.length); // 키워드를 포함하여 반환
    }
    return path; // 키워드를 찾지 못한 경우 그대로 반환
}


function appendSlashIfNeeded(path) {
    // 문자열이 비어 있거나 마지막 문자가 '/'가 아닌 경우 '/'를 추가하여 반환
    if (path === '' || path.charAt(path.length - 1) !== '/') {
        return path + '/';
    }
    return path; // 이미 마지막 문자가 '/'인 경우 그대로 반환
}


// 수정된 JSON 파일 다운로드
function downloadData(dataObject) {
    if (!dataObject || Object.keys(dataObject).length === 0) {
        alert('No data to download');
        return;
    }
    
    // 변환할 데이터를 준비합니다.
    const dataAsText = `const jsonData = ${JSON.stringify(dataObject, null, 2)};`;

    // Blob을 생성하여 파일로 만듭니다.
    const blob = new Blob([dataAsText], { type: 'text/javascript' });

    // URL을 생성하여 다운로드 링크를 만듭니다.
    const url = URL.createObjectURL(blob);

    // 다운로드 링크를 생성하고 클릭하여 다운로드합니다.
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.js';
    a.click();

    // URL을 해제합니다.
    URL.revokeObjectURL(url);
}



// =============================================================================================================================================================

//배포 파일들 이름 변경
async function ReplacePathValue1(item, type){

    var Value = $(".basePathValue").val();
    var fileName = "";
    var extension = item.split('.').pop();

    var newPath = await getSiteDate(Value);

    if( item.indexOf(newPath['java_old']) === 0){ 

        item = item.replace(newPath['java_old'], newPath['java_new'] ).replace(".java", ".class");
        item = (type == "type1")? combination(item) : await combination2(item, Value);

    }else if(item.indexOf(newPath['xml_old']) === 0){ 

        item = item.replace(newPath['xml_old'], newPath['xml_new']);
        item = (type == "type1")? combination(item) : await combination2(item, Value);

    }else if(item.indexOf(newPath['jsp_old']) === 0){

        item = item.replace(newPath['jsp_old'], newPath['jsp_new']);
        item = (type == "type1")? combination(item) : await combination2(item, Value);
    }else{
        item = item.replace(newPath['script_old'], newPath['script_new'] );
        item = (type == "type1")? combination(item) : await combination2(item, Value);
    }

    return item + "\n\n";
}

async function ReplacePathValue3(item){

    var array = item.replace("\n\n", "").split(" ");

    var temp = array[array.length - 2]; // 두 번째로 마지막 요소 저장
    array[array.length - 2] = array[array.length - 1]; // 마지막 요소를 두 번째로 마지막 요소로 대체
    array[array.length - 1] = temp; // 저장된 값으로 마지막 요소 대체

    return array.join(" ") + "\n\n"; // 수정된 배열을 문자열로 반환
}



function combination(item){

    fileName = item.substring(item.lastIndexOf("/") + 1).replace(".java", ".class");
    item = item.substring(0, item.lastIndexOf("/"));
    item = "cd " + item + "; " ;
    item += "cp " + fileName + " " + fileName + now;

    return item;
}

async function combination2(item, value){
    fileName = item.substring(item.lastIndexOf("/") + 1);
    item = item.substring(0, item.lastIndexOf("/"));

    var homePath = await getHomePath(value)

    item = "cp "+ homePath['homePath'] + now + "/" + fileName + " " + item;
    
    return item;
}


// =============================================================================================================================================================


$(document).ready( async function(){

    await createBasePathValue();
    
    $(".fileName").empty();
    $(".fileName").append("파일명 : " + now); 
    
    $(".change").on("click", async function()  {  

        var value = $(".basePathValue").val();

        if(value === "0"){
            Swal.fire({
                icon: "error",
                title: "배포 사이트를 선택해 주세요",
                timer: 1000,
            });

            return false;
        }

        var transfor = $(".transfor").val();

        // 원본 
        var transforArray = transfor.split("\n");


        // 이전 내용을 지우고
        $(".returnValue1").empty();
        $(".returnValue2").empty();
        $(".returnValue3").empty();

        for (const item of transforArray) {

            const [result1, result2, asyncResult1] = await Promise.all([
                ReplacePathValue1(item, 'type1'),
                ReplacePathValue1(item, 'type2'),
                ReplacePathValue1(item, 'type1').then(ReplacePathValue3)
            ]);

            $(".returnValue1").append(result1);
            $(".returnValue2").append(result2);
            $(".returnValue3").append(asyncResult1);
        }
    })

    $(".saveProject").on("click", function() {
        var projectData = $("#saveProject").serializeArray();
        saveProject(projectData);
    })

})




// =============================================================================================================================================================



  