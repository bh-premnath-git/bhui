import { useSelector } from "react-redux";

export const buildData = [
    {
        id: 1,
        icon: <img src="/assets/buildPipeline/6.svg" alt="" width={40} height={40} />,
        expandIcon: <img src="/assets/buildPipeline/21.svg" alt="" width={90} height={40} />,
        text: 'Source',
        className: 'text-white ',
        title: 'Source',
        dataSet: [
            {
                id: 1,
                lead: '/assets/buildPipeline/7.png',
                line: '/assets/buildPipeline/Line 1.png',
                title: 'Order',
            },
            {
                id: 2,
                lead: '/assets/buildPipeline/8.png',
                line: '/assets/buildPipeline/Line 2.png',
                title: 'Order',
            },
            {
                id: 3,
                lead: '/assets/buildPipeline/9.png',
                line: '/assets/buildPipeline/Line 3.png',
                title: 'Order',
            }
        ]
    },
    {
        id: 2,
        icon: <img src="/assets/buildPipeline/7.svg" alt="" width={40} height={40} />,
        expandIcon: <img src="/assets/buildPipeline/22.svg" alt="" width={90} height={40} />,
        text: 'Target', title: 'Target', dataSet: [
            {
                id: 1,
                lead: '/assets/buildPipeline/7.png',
                line: '/assets/buildPipeline/Line 1.png',
                title: 'Order',
            },
            {
                id: 2,
                lead: '/assets/buildPipeline/7.png',
                line: '/assets/buildPipeline/Line 1.png',
                title: 'Order',
            },
            {
                id: 3,
                lead: '/assets/buildPipeline/7.png',
                line: '/assets/buildPipeline/Line 1.png',
                title: 'Order',
            }
        ]
    },
    {
        id: 3,
        icon: <img src="/assets/buildPipeline/8.svg" alt="" width={40} height={40} />,
        expandIcon: <img src="/assets/buildPipeline/26.svg" alt="" width={90} height={40} />,
        text: 'Filter', title: 'Filter', dataSet: [
            {
                id: 1,
                lead: '/assets/buildPipeline/8.png',
                line: '/assets/buildPipeline/Line 2.png',
                title: 'Order',
            },
            {
                id: 2,
                lead: '/assets/buildPipeline/8.png',
                line: '/assets/buildPipeline/Line 2.png',
                title: 'Order',
            },
            {
                id: 3,
                lead: '/assets/buildPipeline/8.png',
                line: '/assets/buildPipeline/Line 2.png',
                title: 'Order',
            }
        ]
    },
    {
        id: 4,
        icon: <img src="/assets/buildPipeline/9.svg" alt="" width={40} height={40} />,
        expandIcon: <img src="/assets/buildPipeline/23.svg" alt="" width={90} height={40} />,
        text: 'Join',title: 'Join', dataSet: [
            {
                id: 1,
                lead: '/assets/buildPipeline/9.png',
                line: '/assets/buildPipeline/Line 3.png',
                title: 'Order',
            },
            {
                id: 2,
                lead: '/assets/buildPipeline/9.png',
                line: '/assets/buildPipeline/Line 3.png',
                title: 'Order',
            },
            {
                id: 3,
                lead: '/assets/buildPipeline/9.png',
                line: '/assets/buildPipeline/Line 3.png',
                title: 'Order',
            }
        ]
    },
    {
        id: 5,
        icon: <img src="/assets/buildPipeline/10.svg" alt="" width={40} height={40} />,
        expandIcon: <img src="/assets/buildPipeline/24.svg" alt="" width={90} height={40} />,
        text: 'Router', title: 'Router', dataSet: [
            {
                id: 1,
                lead: '/assets/buildPipeline/route.png',
                line: '/assets/buildPipeline/Line 4.png',
                title: 'Order',
            },
            {
                id: 2,
                lead: '/assets/buildPipeline/route.png',
                line: '/assets/buildPipeline/Line 4.png',
                title: 'Order',
            },
            {
                id: 3,
                lead: '/assets/buildPipeline/route.png',
                line: '/assets/buildPipeline/Line 4.png',
                title: 'Order',
            }
        ]
    },
    {
        id: 6,
        icon: <img src="/assets/buildPipeline/11.svg" alt="" width={40} height={40} />,
        expandIcon: <img src="/assets/buildPipeline/25.svg" alt="" width={100} height={100} />,
        text: 'Transform', title: 'Transform', dataSet: [
            {
                id: 1,
                lead: '/assets/buildPipeline/11.png',
                line: '/assets/buildPipeline/Line 5.png',
                title: 'Order',
            },
            {
                id: 2,
                lead: '/assets/buildPipeline/11.png',
                line: '/assets/buildPipeline/Line 5.png',
                title: 'Order',
            },
            {
                id: 3,
                lead: '/assets/buildPipeline/11.png',
                line: '/assets/buildPipeline/Line 5.png',
                title: 'Order',
            }
        ]
    },
    {
        id: 7,
        icon: <img src="/assets/buildPipeline/12.svg" alt="" width={40} height={40} />,
        expandIcon: <img src="/assets/buildPipeline/27.svg" alt="" width={90} height={40} />,
        text: 'Ship', title: 'Ship', dataSet: [
            {
                id: 1,
                lead: '/assets/buildPipeline/ship.png',
                line: '/assets/buildPipeline/Line 6.png',
                title: 'Order',
            },
            {
                id: 2,
                lead: '/assets/buildPipeline/ship.png',
                line: '/assets/buildPipeline/Line 6.png',
                title: 'Order',
            },
            {
                id: 3,
                lead: '/assets/buildPipeline/ship.png',
                line: '/assets/buildPipeline/Line 6.png',
                title: 'Order',
            }
        ]
    },
    {
        id: 8,
        icon: <img src="/assets/buildPipeline/add.svg" alt="" width={40} height={40} />,
        expandIcon: <img src="/assets/buildPipeline/add.svg" alt="" width={40} height={40} />,
        text: '', title: 'Transformation', dataSet: [
            {
                id: 1,
                lead: '/assets/buildPipeline/7.png',
                line: '/assets/buildPipeline/Line 1.png',
                title: 'Order',
            },
            {
                id: 2,
                lead: '/assets/buildPipeline/7.png',
                line: '/assets/buildPipeline/Line 1.png',
                title: 'Order',
            },
            {
                id: 3,
                lead: '/assets/buildPipeline/7.png',
                line: '/assets/buildPipeline/Line 1.png',
                title: 'Order',
            }
        ]
    },
    // { id: 7, icon: <IoMdAdd />, text: 'Add Transformation', className: 'bg-white text-dark border',line: '/assets/buildPipeline/Line 1.png',titles: ['Sort', 'Aggregate', 'Lookup', 'Aggregate', 'Deduplicate', 'Limit','Aggregate','Union']},
];


export const transformList = [
    {
        id: 1,
        lead: '/assets/buildPipeline/sort.png',
        line: '/assets/buildPipeline/Line 7.png',
        title: 'Sort',
    },
    {
        id: 2,
        lead: '/assets/buildPipeline/aggrigate.png',
        line: '/assets/buildPipeline/Line 7.png',
        title: 'Aggregate',
    },
    {
        id: 3,
        lead: '/assets/buildPipeline/lookup.png',
        line: '/assets/buildPipeline/Line 7.png',
        title: 'Lookup',
    },
    {
        id: 4,
        lead: '/assets/buildPipeline/dq.png',
        line: '/assets/buildPipeline/Line 7.png',
        title: 'DQ Check',
    },
    {
        id: 5,
        lead: '/assets/buildPipeline/dedupe.png',
        line: '/assets/buildPipeline/Line 7.png',
        title: 'Dedupe',
    },
    {
        id: 6,
        lead: '/assets/buildPipeline/repartician.png',
        line: '/assets/buildPipeline/Line 7.png',
        title: 'Repartition ',
    },
    {
        id: 7,
        lead: '/assets/buildPipeline/sql.png',
        line: '/assets/buildPipeline/Line 7.png',
        title: 'SQL Transformation',
    },
    {
        id: 8,
        lead: '/assets/buildPipeline/union.png',
        line: '/assets/buildPipeline/Line 7.png',
        title: 'Union',
    },
    {
        id: 9,
        lead: '/assets/buildPipeline/limit.png',
        line: '/assets/buildPipeline/Line 7.png',
        title: 'Limit',
    },
    {
        id: 10,
        lead: '/assets/buildPipeline/change-detection.png',
        line: '/assets/buildPipeline/Line 7.png',
        title: 'Change Detection',
    }
];

