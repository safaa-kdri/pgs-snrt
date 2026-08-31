const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function getSignedStampCoordinates(position = {}, pageSize = {}) {
    const pageWidth = Number(pageSize.width || 595);
    const pageHeight = Number(pageSize.height || 842);
    const x = Number(position.x ?? 50);
    const y = Number(position.y ?? 280);
    const width = Number(position.width ?? 150);
    const height = Number(position.height ?? 60);
    const page = Number(position.page ?? 0);

    const maxX = Math.max(0, pageWidth - width);
    const maxY = Math.max(0, pageHeight - height);

    return {
        x: clamp(x, 0, maxX),
        y: clamp(pageHeight - y - height, 0, maxY),
        width,
        height,
        page,
    };
}

module.exports = {
    getSignedStampCoordinates,
};
