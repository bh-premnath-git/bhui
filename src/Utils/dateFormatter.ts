export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const pad = (n: number) => (n < 10 ? `0${n}` : n);

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Months are zero-indexed
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = pad(hours);

    return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
};


export const formatedDate = (dateString: string): string => { // time to date dd/mm/yyyy
    const date = new Date(dateString);
    const pad = (n: number) => (n < 10 ? `0${n}` : n);

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Months are zero-indexed
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = pad(hours);

    return `${day}/${month}/${year} `;
};
