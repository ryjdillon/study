import {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import * as d3 from 'd3';
import { Registry, initializeTrrack } from '@trrack/core';
import debounce from 'lodash.debounce';
import { StimulusParams } from '../../../store/types';
import LineChartComponent from './LineChart'; // Renamed import
import RangeSelectorComponent from './RangeSelector'; // Renamed import

export interface ChartParams {
  dataset: string;
  start_date: string;
  end_date: string;
  initial_selection: string[];
  allow_time_slider: boolean;
  x_var: string;
  y_var: string;
  cat_var: string;
  group_var: string;
  guardrail: string;
}

interface DataRow {
  [key: string]: string | number; // Adjust as needed based on your CSV structure
}

interface Item {
  name: string;
  group: string;
}

export function DataExplorer({ parameters }: StimulusParams<ChartParams>) {
  const [chartData, setChartData] = useState<DataRow[] | null>(null);
  const [dataname] = useState<string>(parameters.dataset);
  const [currentSelection] = useState<string[] | null>(parameters.initial_selection);
  const [items, setItems] = useState<Item[] | null>(null); // Use Item type instead of any
  const [dateRange, setDateRange] = useState<[Date, Date] | null>([new Date(parameters.start_date), new Date(parameters.end_date)]);
  const [guardrail] = useState<string>(parameters.guardrail);

  useEffect(() => {
    d3.csv(`./data/${dataname}.csv`).then((data: DataRow[]) => {
      setChartData(data);
      setItems(Array.from(new Set(data.map((row) => (JSON.stringify({
        name: row[parameters.cat_var],
        group: row[parameters.group_var],
      }))))).map((row) => JSON.parse(row)));
    });
  }, [dataname, parameters]);

  const filteredData = useMemo(() => {
    if (chartData && dateRange) {
      return chartData.filter((val) => {
        const date = new Date(val[parameters.x_var]);
        return date.getTime() >= dateRange[0].getTime() && date.getTime() <= dateRange[1].getTime();
      });
    }
    return null;
  }, [chartData, dateRange, parameters.x_var]);

  const { actions, trrack } = useMemo(() => {
    const reg = Registry.create();
    const selectionAction = reg.register('selection', (state, currSelection: string[]) => {
      state.selection = currSelection;
      return state;
    });

    const rangeAction = reg.register('range', (state, currRange: [string, string]) => {
      state.range = currRange;
      return state;
    });

    const trrackInst = initializeTrrack({
      registry: reg,
      initialState: {
        selection: [],
        range: [parameters.start_date, parameters.end_date],
      },
    });

    return {
      actions: {
        selection: selectionAction,
        range: rangeAction,
      },
      trrack: trrackInst,
    };
  }, [parameters.end_date, parameters.start_date]);

  const trackRange = useCallback((newRange: [Date, Date]) => {
    trrack.apply('Change daterange', actions.range([newRange[0].toISOString().slice(0, 10), newRange[1].toISOString().slice(0, 10)]));
  }, [trrack, actions]);

  const debouncedTrackRange = useMemo(() => debounce(trackRange, 200), [trackRange]);

  return filteredData && items && dateRange && currentSelection ? (
    <div>
      <div>
        <div>
          <h3>
            Loan Balance over Time
          </h3>
        </div>
        <div>
          <LineChartComponent
            parameters={parameters}
            data={filteredData}
            dataname={dataname}
            items={items}
            selection={currentSelection}
            range={dateRange}
            guardrail={guardrail}
          />
          {parameters.allow_time_slider && (
            <div style={{ width: '700px' }}>
              <RangeSelectorComponent
                parameters={parameters}
                setRange={setDateRange}
                trackRange={debouncedTrackRange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  ) : <div>Loading...</div>;
}

export default DataExplorer;
