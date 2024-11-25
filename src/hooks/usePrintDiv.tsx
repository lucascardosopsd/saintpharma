"use client";
type PrintDivProps = {
  divId: string;
  height: number;
  width: number;
};

const usePrintDiv = ({ divId, height, width }: PrintDivProps) => {
  let mywindow = window.open(
    "",
    "PRINT",
    `height=${height},width=${width},top=100,left=100`
  );

  if (mywindow) {
    mywindow.document.write("</head><body >");
    mywindow.document.write(document.getElementById(divId)!.innerHTML);
    mywindow.document.write("</body></html>");

    // necessary for IE >= 10
    mywindow.document.close();
    mywindow.focus();

    mywindow.print();
    mywindow.close();
  }

  return <></>;
};

export default usePrintDiv;
