import { useState, useRef, SyntheticEvent } from 'react';
import Papa from 'papaparse';
import Encoding from 'encoding-japanese';
import { Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import styles from './index.module.css';
import { csvData, result } from '../../types/csv';
import { PERCENT, RENT, UTILITY_LABEL, FINANCIAL } from '../../utils/constant';

const CSVUpload = () => {
  const [csvName, setCsvName] = useState<string>(),
        [isError, setIsError] = useState<boolean>(true),
        [result, setResult] = useState<result>(),
        [expanded, setExpanded] = useState<string | boolean>(),
        inputRef = useRef<HTMLInputElement>(null!);

  const fileUpload = () => {
    inputRef.current.click();
  };

  const accordionChange =
    (panel: string) =>
    (event: SyntheticEvent<Element, Event>, expanded: boolean) => {
      setExpanded(expanded ? panel : false);
    };

  const _onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if(e.target && e.target.result && typeof e.target.result !== 'string'){
        const result = e.target.result;
        const codes = new Uint8Array(result);
        const encoding = Encoding.detect(codes);
        if(typeof encoding !== 'boolean'){
          const unicodeString = Encoding.convert(codes, {
            to: 'UNICODE',
            from: encoding,
            type: 'string',
          });
          Papa.parse(unicodeString, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
              calculation(results.data);
            },
          });
        }
      }
    };
    if (file) {
      reader.readAsArrayBuffer(file);
      setCsvName(file.name);
    }
  };

  const calculation = (data: any) => {
    const init = 0;
    const draft: result = {
      takeru: {
        cash: init,
        card: init,
        utility: init,
        half: init,
        total: init,
      },
      reina: {
        cash: init,
        card: init,
        utility: init,
        half: init,
        total: init,
      },
      total: {
        cash: init,
        card: init,
        utility: init,
      },
    };
    data.map((row: csvData) => {
      if (row.計算対象 === 1) {
        switch (row.大項目) {
          case UTILITY_LABEL[0]:
          case UTILITY_LABEL[1]:
            switch (row.保有金融機関) {
              case FINANCIAL.TAKERU_CASH:
              case FINANCIAL.TAKERU_CARD:
                draft.takeru.utility += -row['金額（円）'];
                break;
              case FINANCIAL.REINA_CASH:
              case FINANCIAL.REINA_CARD:
                draft.reina.utility += -row['金額（円）'];
                break;
            }
            break;
          default:
            switch (row.保有金融機関) {
              case FINANCIAL.TAKERU_CASH:
                draft.takeru.cash += -row['金額（円）'];
                break;
              case FINANCIAL.TAKERU_CARD:
                draft.takeru.card += -row['金額（円）'];
                break;
              case FINANCIAL.REINA_CASH:
                draft.reina.cash += -row['金額（円）'];
                break;
              case FINANCIAL.REINA_CARD:
                draft.reina.card += -row['金額（円）'];
                break;
            }
        }
      }
    });
    draft.takeru.total = draft.takeru.cash + draft.takeru.card + draft.takeru.utility;
    draft.reina.total = draft.reina.cash + draft.reina.card + draft.reina.utility + RENT;
    draft.total.cash = draft.takeru.cash + draft.reina.cash;
    draft.total.card = draft.takeru.card + draft.reina.card;
    draft.total.utility = draft.takeru.utility + draft.reina.utility;
    draft.takeru.half =
      (draft.total.cash + draft.total.card + RENT) * PERCENT.TAKERU + (draft.total.utility / 3) * 2;
    draft.reina.half =
      (draft.total.cash + draft.total.card + RENT) * PERCENT.REINA + (draft.total.utility / 3) * 1;
    if (
      draft.total.cash + draft.total.card + draft.total.utility + RENT ===
      draft.takeru.half + draft.reina.half
    ) {
      setIsError(false);
    }
    setResult(draft);
  };

  const sendMailOnClick = () =>{
    console.log('sendMailOnClick')
  }

  const format = (num?: number) => {
    return num ? num.toLocaleString() : 0 ;
  }

  const fileUploadArea = (
    <div className={styles.fileUploadArea}>
      <div>
        <button className={styles.button} onClick={fileUpload}>
          <UploadFileIcon component='svg' sx={{ color: '#eaecfa' }} />
          {csvName ? 'ファイルを変更する' : 'ファイルをアップロード'}
        </button>
        <input hidden type='file' accept='text/csv' ref={inputRef} onChange={_onChange} />
      </div>
      <Typography variant='caption'>{csvName}</Typography>
    </div>
  );

  const tableHeader = (
    <TableHead>
      <TableRow>
        <TableCell align='right' component='th' scope='row'></TableCell>
        <TableCell align='center'>武尊</TableCell>
        <TableCell align='center'>玲奈</TableCell>
        <TableCell align='center'>合計</TableCell>
      </TableRow>
    </TableHead>
  )

  const resultTable = (
    <>
      <Accordion
        expanded={expanded === 'panel1'}
        onChange={accordionChange('panel1')}
        className={styles.accordion}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel1d-content'
          id='panel1d-header'
        >
          <Typography variant='h6' component='h3' className={styles.tableTitle}>
            支払った金額
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={styles.accordionDetail}>
          <Paper>
            <TableContainer>
              <Table sx={{ minWidth: 700 }} aria-label='customized table'>
                {tableHeader}
                <TableBody>
                  <TableRow>
                    <TableCell align='right' component='th' scope='row'>
                      現金
                    </TableCell>
                    <TableCell align='right'>{format(result?.takeru.cash)}</TableCell>
                    <TableCell align='right'>{format(result?.reina.cash)}</TableCell>
                    <TableCell align='right'>{format(result?.total.cash)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='right' component='th' scope='row'>
                      カード
                    </TableCell>
                    <TableCell align='right'>{format(result?.takeru.card)}</TableCell>
                    <TableCell align='right'>{format(result?.reina.card)}</TableCell>
                    <TableCell align='right'>{format(result?.total.card)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='right' component='th' scope='row'>
                      水道・光熱費
                    </TableCell>
                    <TableCell align='right'>{format(result?.takeru.utility)}</TableCell>
                    <TableCell align='right'>{format(result?.reina.utility)}</TableCell>
                    <TableCell align='right'>{format(result?.total.utility)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='right' component='th' scope='row'>
                      家賃
                    </TableCell>
                    <TableCell align='right'>0</TableCell>
                    <TableCell align='right'>{format(RENT)}</TableCell>
                    <TableCell align='right'>{format(RENT)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='right' component='th' scope='row'>
                      合計
                    </TableCell>
                    <TableCell align='right'>{format(result?.takeru.total)}</TableCell>
                    <TableCell align='right'>{format(result?.reina.total)}</TableCell>
                    <TableCell align='right'>
                      {result ? format(result.takeru.total + result.reina.total) : null}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === 'panel2'}
        onChange={accordionChange('panel2')}
        className={styles.accordion}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel1d-content'
          id='panel1d-header'
        >
          <Typography variant='h6' component='h3' className={styles.tableTitle}>
            折半金額
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={styles.accordionDetail}>
          <Paper>
            <TableContainer>
              <Table sx={{ minWidth: 700 }} aria-label='customized table'>
                {tableHeader}
                <TableBody>
                  <TableRow>
                    <TableCell align='right' component='th' scope='row'>
                      折半金額
                    </TableCell>
                    <TableCell align='right'>{format(result?.takeru.half)}</TableCell>
                    <TableCell align='right'>{format(result?.reina.half)}</TableCell>
                    <TableCell align='right'>-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='right' component='th' scope='row'>
                      実際に支払った金額
                    </TableCell>
                    <TableCell align='right'>{format(result?.takeru.total)}</TableCell>
                    <TableCell align='right'>{format(result?.reina.total)}</TableCell>
                    <TableCell align='right'>-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='right' component='th' scope='row'>
                      差分
                    </TableCell>
                    <TableCell align='right'>
                      {result ? format(result.takeru.half - result.takeru.total) : null}
                    </TableCell>
                    <TableCell align='right'>
                      {result ? format(result.reina.half - result.reina.total) : null}
                    </TableCell>
                    <TableCell align='right'>-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </AccordionDetails>
      </Accordion>

      <div className={styles.resultArea}>
        <Typography variant='h5' component='p' align='center'>
          今月の振り込みは
          <br />
          <strong>
            {result ? (result.takeru.half - result.takeru.total > 0 ? '武尊' : '玲奈') : null}
          </strong>{' '}
          が
          <strong>
            {result
              ? result.takeru.half - result.takeru.total > 0
                ? format(result.takeru.half - result.takeru.total)
                : format(result.reina.half - result.reina.total)
              : null}
          </strong>
          円<br />
          振り込むこと。
        </Typography>
        <button className={styles.sendMainButton} onClick={sendMailOnClick}>
          メールを送る
        </button>
      </div>
    </>
  );

  return (
    <div className={styles.csv_upload}>
      <Typography variant='h5' component='h2'>
        CSV アップロード
      </Typography>
      {fileUploadArea}
      {result ? (
        !isError ? (
          resultTable
        ) : (
          <p>Error：計算に問題があります。システム責任者にご連絡ください。</p>
        )
      ) : null}
    </div>
  );
};

export default CSVUpload;
