import { useEffect, useState } from 'react';

export default function Countdown({ weddingDate }: { weddingDate: string }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const targetDate = new Date(weddingDate);
        console.log('Target:', targetDate.toString());

        const updateCountdown = () => {
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('The big day is here!');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [weddingDate]);

    return (
        <div>
            <p className="text-lg font-semibold text-center">{timeLeft}<br /> until our big day!!</p>
        </div>
    );
}
