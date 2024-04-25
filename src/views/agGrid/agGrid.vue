<template>
  <ag-grid-vue style="width: 600px; height: 300px;"
               class="ag-theme-alpine"
               :columnDefs="columnDefs"
               @grid-ready="gridReady"
               :rowData="rowData">
  </ag-grid-vue>
  <button @click="excelDownTempl">엑셀템플릿 다운로드</button>
  <input type="file" ref="fileBrower" id="addFile" v-if="hasBrowsed" :accept="accept">
  <button @click="uploadExcel">업로드</button>
  <button @click="dbSave">DB저장</button>
</template>

<script>
import {read, utils} from "xlsx";
import _ from "lodash";
import axios from "axios";
export default {
  name: "agGrid",
  data() {
    return {
      accept : ['.xlsx', 'xls'], //업로드 확장자 제한
      hasBrowsed : true,
      gridApi: null,
      gridColumnApi:null,
      columnDefs: [
        { headerName: "책 제목", field: "name",},
        { headerName: "출판사", field: "publisher" },
        { headerName: "작가", field: "author" },
        { headerName: "가격", field: "price"},
        { headerName: "ISBN", field: "isbn"},
      ],
      rowData: [
      ],
    };
  },
  methods : {
    clearFile() {
      this.hasBrowsed = false;
      this.$nextTick(() => {
        this.hasBrowsed = true;
      });
    },
    gridReady(params) {
      this.gridApi = params.api;
    },

    //그리드 데이터를 서버로 보내기(DB-Insert)
    dbSave() {
      let postData = [];
      for (const bindRow of this.rowData) {
        postData.push(bindRow);
      }
      axios.post('http://localhost:9090/api/v1/ag-grid/data-write', postData, {
            headers: { "Content-Type": `application/json`}
          }
      ).then((res) => {
        console.log(res);
      });

    },
    uploadExcel() {
      let files = this.$refs.fileBrower.files;
      if(files[0]) {
        this.hasBrowsed = true;
        let sheetInfo;
        let reader = new FileReader();

        reader.onload = (e) => {
          let data = e.target.result;
          data = new Uint8Array(data);

          //get file
          let excelFile = read(data, {type:"array", cellText:false, cellDates: true});

          //get prased object
          const sheetName = excelFile.SheetNames[0];
          sheetInfo = utils.sheet_to_json(excelFile.Sheets[sheetName], {
            header : 1,
            dateNF : 'yyyy-mm-dd',
            raw : false
          });
          this.setLoadData(sheetInfo);
        };
        reader.readAsArrayBuffer(files[0]);
      }
      this.clearFile();
    },

    setLoadData(sheetInfo) {
      let arr = [];

      for (let i = 1; i < sheetInfo.length; i++) {
        let item = sheetInfo[i];
        //항목 빈값 체크
        if(!_.isEmpty(item[0]) && !_.isEmpty(item[1]) && !_.isEmpty(item[2]) && !_.isEmpty(item[3]) && !_.isEmpty(item[4])) {
          arr.push(item);
        }
      }

      let failCnt = 0;
      for(let i = 0; i < arr.length; i++) {
        let item = arr[i];
        if (!this.bindDataValid(i, item)) {
          failCnt++;
          break;
        }
      }

      if(failCnt=== 0) {
        let insertList = [];
        for (let i = 0; i < arr.length ; i++) {
          let item = arr[i];
          let param = {
            name : item[0],
            publisher : item[1],
            author : item[2],
            price : item[3],
            isbn : item[4],
          };
          insertList.push(param);
        }

        this.rowData = insertList;
        this.gridApi.setRowData(this.rowData);
      }
    },

    bindDataValid(idx, item) {
      let hang = Number(idx) + 1;
      if(this.isEmpty(item[0])) {
        alert(`[` + hang +`]행 데이터가 없습니다.`);
        return false;
      }
      if(this.isEmpty(item[1])) {
        alert(`[` + hang +`]행 데이터가 없습니다.`);
        return false;
      }
      if(this.isEmpty(item[2])) {
        alert(`[` + hang +`]행 데이터가 없습니다.`);
        return false;
      }
      return true;
    },

    //빈값, null, undefined 체크
    isEmpty(str) {
      return str === "" || str === undefined || str === null || str === "null";
    },

    //엑셀 템플릿 다운로드
    excelDownTempl() {
      const xlsx = require('xlsx');
      const book = xlsx.utils.book_new();

      //컬럼 헤더 정의
      let columns = [];
      columns.push(['name', 'publisher', 'author', 'price', 'isbn']);

      const worksheetByAoa = xlsx.utils.aoa_to_sheet(columns);

      //컬럼 사이즈 지정
      worksheetByAoa['!cols'] = [
        {wch:30},
        {wch:15},
        {wch:15},
        {wch:15},
        {wch:15},
      ];

      //시트설정
      const sheetName = "";
      const templateExcelFileName = "도서업로드.xlsx";
      xlsx.utils.book_append_sheet(book, worksheetByAoa, sheetName);
      xlsx.writeFile(book, templateExcelFileName);
    },

  }
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
