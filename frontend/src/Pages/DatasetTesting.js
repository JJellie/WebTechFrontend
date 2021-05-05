import DataFrame from 'dataframe-js';
import DataFrame, { Row } from 'dataframe-js';

const data = DataFrame.fromCSV("C:\Users\20192520\Downloads\enron-v1.csv").then(df => df);

data.show()