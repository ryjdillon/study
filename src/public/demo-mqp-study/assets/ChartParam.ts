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
