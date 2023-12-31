import { faDice, faPlay, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import DiceContainer from "./components/DiceContainer";
import Die from "./components/Die";
import Footer from "./components/Footer";
import Header from "./components/Header";
import HelpButton from "./components/HelpButton";
import Modal from "./components/Modal";
import PlayButton from "./components/PlayButton";
import ResetButton from "./components/ResetButton";
import Timer from "./components/Timer";
import click from "./sounds/click.wav";
import click2 from "./sounds/click2.wav";
import error from "./sounds/error.wav";
import roll from "./sounds/roll.wav";
import win from "./sounds/win.wav";
import { allNewDice } from "./utils/allNewDice";
import { generateNewDie } from "./utils/generateNewDie";

function App() {
    const [dice, setDice] = useState(allNewDice());
    const [tenzies, setTenzies] = useState(false);
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    if (time === 60) {
        new Audio(error).play();
    }

    useEffect(() => {
        if (tenzies) {
            setIsRunning(false);
            new Audio(win).play();
        }
    }, [tenzies]);

    useEffect(() => {
        const allHeld = dice.every((die) => die.isHeld);
        const firstValue = dice[0].value;
        const allSameValue = dice.every((die) => die.value === firstValue);
        if (allHeld && allSameValue) {
            setTenzies(true);
        }
    }, [dice]);

    const resetGame = () => {
        setDice((oldDice) =>
            oldDice.map((die) => {
                return generateNewDie();
            })
        );
        setIsRunning(false);
        setTime(0);
        new Audio(click2).play();
    };

    const newGame = () => {
        setTenzies(false);
        setTime(0);
        setDice(allNewDice());
        setIsRunning(false);
        new Audio(click2).play();
    };

    const rollDice = () => {
        setDice((oldDice) =>
            oldDice.map((die) => {
                return die.isHeld ? die : generateNewDie();
            })
        );
        new Audio(roll).play();
    };

    const holdDice = (id) => {
        if (isRunning) {
            setDice((oldDice) =>
                oldDice.map((die) => {
                    return die.id === id
                        ? { ...die, isHeld: !die.isHeld }
                        : die;
                })
            );
        }
        new Audio(click).play();
    };

    const startGame = () => {
        setIsRunning(true);
        rollDice();
    };

    const diceElements = dice.map((die) => (
        <Die
            key={die.id}
            value={die.value}
            isHeld={die.isHeld}
            holdDice={() => holdDice(die.id)}
        />
    ));

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const tab =
        String.fromCharCode(160) +
        String.fromCharCode(160) +
        String.fromCharCode(160) +
        String.fromCharCode(160);

    const help = () => {
        toast((t) => (
            <div className="h-fit mb-4 relative">
                <FontAwesomeIcon
                    icon={faXmark}
                    onClick={() => toast.dismiss(t.id)}
                    className="absolute top-o right-0 text-gray-400 hover:text-red-600 cursor-pointer"
                />
                <h1 className="font-bold pb-4">How to play?</h1>
                <span className="font-semibold text-[.8rem]">
                    {tab}The goal of the game is to match all ten dice to
                    display the same number. Held dice will keep their numbers
                    during subsequent rolls. The dice will show the current
                    numbers they represent. You win when all ten dice display
                    the same number.
                    <br />
                    <br />
                    <h1>Instructions:</h1>
                    1. Start the game
                    <br />
                    2. Click the 'Roll' button to roll the dice.
                    <br />
                    3. Click on any die to toggle holding or releasing it. Use
                    the 'Hold' feature to maintain specific numbers on selected
                    dice.
                </span>
            </div>
        ));
    };

    return (
        <div className="flex flex-col h-screen w-screen justify-center overflow-hidden items-center bg-white-100 select-none">
            <Toaster position="bottom-right" />
            <Modal
                tenzies={tenzies}
                onClick={newGame}
                time={time}
                minutes={minutes}
                seconds={seconds}
            />
            <Header>
                <Timer minutes={minutes} seconds={seconds} run={isRunning} />
            </Header>
            <DiceContainer>{diceElements}</DiceContainer>

            {!tenzies &&
                (isRunning ? (
                    <PlayButton onClick={rollDice} icon={faDice} />
                ) : (
                    <PlayButton onClick={startGame} icon={faPlay} />
                ))}
            <div className="w-screen h-screen absolute flex z-[1] items-end">
                {isRunning && <ResetButton onClick={resetGame} />}
                <Footer />
                <HelpButton onClick={help} />
            </div>
        </div>
    );
}

export default App;
