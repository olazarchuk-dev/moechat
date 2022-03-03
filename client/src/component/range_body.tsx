import * as React from 'react';
import { Range } from 'react-range'; // 1. сначала импортируем наш компонент Range из установленного пакета
import { Message } from "../types/message";

// TODO: @see https://www.geeksforgeeks.org/how-to-add-slider-in-next-js
/*
 * NextJS — это фреймворк на основе React.
 * Он может разрабатывать красивые веб-приложения для различных платформ, таких как Windows, Linux и Mac.
 *
 * Чтобы добавить слайдер, мы воспользуемся пакетом react-range.
 * Пакет react-range помогает нам интегрировать ползунки в любое место нашего приложения.
 *
 * 1. Создать приложение NextJS, используя следующую команду:
 *    npx create-next-app gfg
 * 2. Установите необходимый пакет 'react-range', используя следующую команду:
 *    npm i react-range
 * 3. Добавление слайдера...
 */

export default function FuncRangeBody({ msg, rangeState }): JSX.Element {
    const msgLength = msg.length;
    // console.log('msgLength', msgLength)
    let messageState = Number('0');
    msg.map((message: Message, index: number) => {
        if (index == msgLength-1) {
            console.log('StateValue:', message.messageState, '<<< sync')
            messageState = Number(message.messageState);
        }
    });

    class RangeBody extends React.Component {

        state = {values: [messageState]}; // 2. после этого мы создаем состояние для хранения начального значения

        render() {
            // console.log('StateValue:', this.state.values[0], '>>> send');
            rangeState.values = this.state.values
            // console.log('msg: ', msg, 'rangeState:', rangeState.values[0]);

            // 3. затем мы добавляем наш компонент Range
            return (
                <>
                    <Range
                        // 4.1 в компоненте диапазона мы устанавливаем минимальное значение, максимальное значение и текущее значение
                        step={1}
                        min={0}
                        max={100}
                        values={this.state.values}

                        // 4.2 в компоненте диапазона мы устанавливаем функцию onChange
                        onChange={(values) =>
                            this.setState({values})
                        }

                        renderTrack={({props, children}) => (
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

                        renderThumb={({props}) => (
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

    return (
        <>
            <RangeBody/>
        </>
    );
}