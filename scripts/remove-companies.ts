import fs from 'fs/promises'
import path from 'path'

const companiesToRemove = [
  "Q10523797", "Q1671623", "Q126366693", "Q6060753", "Q126366671", "Q1537901",
  "Q276345", "Q109787297", "Q378944", "Q115167363", "Q2789310", "Q7295902",
  "Q93559269", "Q52846", "Q108733347", "Q820970", "Q1564880", "Q31884527",
  "Q3181430", "Q219501", "Q10660896", "Q2264039", "Q1142582", "Q54075",
  "Q3924567", "Q1476113", "Q309865", "Q1423707", "Q1703203", "Q126367344",
  "Q731938", "Q10422059", "Q787044", "Q2723182", "Q10526893", "Q899356",
  "Q47508289", "Q10535326", "Q4994121", "Q1805602", "Q10584597", "Q10600414",
  "Q10601765", "Q115167358", "Q4356297", "Q4827724", "Q10425193", "Q60970803",
  "Q862811", "Q4998333", "Q10443840", "Q30938280", "Q60967616", "Q1028092",
  "Q65196379", "Q109773651", "Q52579", "Q187854", "Q1537811", "Q163810",
  "Q674575", "Q10429580", "Q10434929", "Q106625550", "Q109974149", "Q830608",
  "Q188326", "Q1421630", "Q10521828", "Q1467848", "Q1663776", "Q10535401",
  "Q1671804", "Q15702556", "Q63993633", "Q6460556", "Q18541785", "Q558699",
  "Q1123823", "Q10660042", "Q62233", "Q1145493", "Q52825", "Q106627314",
  "Q10400997", "Q10403939", "Q686030", "Q1785637", "Q757164", "Q5028809",
  "Q10443590", "Q3366005", "Q10605629", "Q1753718", "Q52601", "Q747265",
  "Q115167531", "Q1389894", "Q10686298", "Q7654795", "Q2084093", "Q862303",
  "Q157675", "Q792486", "Q106684510", "Q10474816", "Q5290243", "Q505922",
  "Q52618", "Q105965579", "Q1390136", "Q10494308", "Q106647141", "Q3121401",
  "Q106625028", "Q1640495", "Q662174", "Q22077794", "Q3377840", "Q5362569",
  "Q56300993", "Q28836696", "Q1571428", "Q28228137", "Q10397786", "Q671398",
  "Q10461247", "Q106626934", "Q10719187", "Q10720019", "Q98602838", "Q3429427",
  "Q738421", "Q106564093", "Q10429829", "Q10590357", "Q975655", "Q115112945",
  "Q111843935", "Q891345", "Q65083539", "Q47498532", "Q1275733", "Q10494668",
  "Q1337240", "Q10600264", "Q52912", "Q662664", "Q11977084", "Q215293"
]

async function removeCompanies() {
  const beforeDir = 'data/before'
  
  try {
    const files = await fs.readdir(beforeDir)
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue
      
      const filePath = path.join(beforeDir, file)
      const content = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(content)
      
      if (companiesToRemove.includes(data.wikidataId)) {
        await fs.unlink(filePath)
        console.log(`Removed ${file}`)
      }
    }
    
    console.log('Finished removing companies')
  } catch (error) {
    console.error('Error:', error)
  }
}

removeCompanies()
