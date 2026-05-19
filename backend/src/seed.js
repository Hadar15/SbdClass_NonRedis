import { query } from './db.js';
async function main() {
    console.log('DB URL:', process.env.DATABASE_URL);
    console.log('🌱 Seeding events...');
    const events = [
        {
            title: 'Taylor Swift | The Eras Tour',
            description: 'The most anticipated concert of the year. Experience the eras of Taylor Swift.',
            price: 1500000,
            totalStock: 50,
            date: new Date('2026-12-01'),
        },
        {
            title: 'Coldplay: Music of the Spheres',
            description: 'A spectacular audio-visual experience with Coldplay.',
            price: 2500000,
            totalStock: 30,
            date: new Date('2026-11-15'),
        },
        {
            title: 'Bruno Mars Live in Jakarta',
            description: 'Get ready to dance with Bruno Mars.',
            price: 1200000,
            totalStock: 100,
            date: new Date('2026-10-20'),
        },
    ];
    for (const e of events) {
        const eventResult = await query('INSERT INTO events (title, description, price, total_stock, date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, now(), now()) RETURNING id, title', [e.title, e.description, e.price, e.totalStock, e.date]);
        const event = eventResult.rows[0];
        console.log(`✅ Created event: ${event.title} with ID: ${event.id}`);
    }
    console.log('✨ Seeding finished.');
    process.exit(0);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map