import * as React from 'react';
import { Range } from 'react-range';

// TODO: @see https://www.geeksforgeeks.org/how-to-add-slider-in-next-js

export default class RangeBody extends React.Component {
    state = { values: [0] };
    render() {
        console.log('StateValues:', this.state.values, '>>> send');

        return (
            <>
                <Range
                    step={1}
                    min={0}
                    max={100}
                    values={this.state.values}
                    onChange={(values) => this.setState({ values })}
                    renderTrack={({ props, children }) => (
                        <div
                            {...props}
                            style={{
                                ...props.style,
                                height: '20px',
                                width: '100%',
                                backgroundColor: '#312b2b',
                                borderColor: 'green',
                                borderRadius: '5px',
                                borderWidth: 'thin'
                            }}>
                            {children}
                        </div>
                    )}
                    renderThumb={({ props }) => (
                        <div
                            {...props}
                            style={{
                                ...props.style,
                                padding: '10px',
                                backgroundColor: '#312b2b',
                                borderColor: 'green',
                                borderRadius: '5px',
                                borderWidth: 'thin'
                            }}>
                            <span>{this.state.values} %</span>
                        </div>
                    )}
                />
            </>
        );
    }
}
