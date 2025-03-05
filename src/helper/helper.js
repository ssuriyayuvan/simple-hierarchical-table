// helpers.js

export const calculateParentValues = (data) => {
    const updatedRows = data.rows.map(row => {
        if (row.children && row.children.length > 0) {
            const childrenSum = row.children.reduce((sum, child) => sum + child.value, 0);
            row.value = childrenSum;
        }
        return row;
    });

    return { ...data, rows: updatedRows };
};

export const findOriginalValue = (data, id) => {
    let originalValue = null;

    const findValue = (rows) => {
        for (const row of rows) {
            if (row.id === id) {
                originalValue = row.originalValue;
                return;
            }
            if (row.children) {
                findValue(row.children);
            }
        }
    };

    findValue(data.rows);
    return originalValue;
};


export const updateValueAndDistribute = (data, id, newValue) => {
    let updatedData = JSON.parse(JSON.stringify(data));

    const update = (rows) => {
        return rows.map(row => {
            if (row.id === id) {
                row.value = newValue;
            } else if (row.children) {
                row.children = update(row.children);
            }
            return row;
        });
    };

    updatedData.rows = update(updatedData.rows);

    const distributeValue = (rows) => {
        return rows.map(row => {
            if (row.id === id && row.children && row.children.length > 0) {
                const totalInitialValue = row.children.reduce((sum, child) => sum + child.value, 0);
                row.children = row.children.map(child => {
                    const contribution = child.value / totalInitialValue;
                    child.value = parseFloat((newValue * contribution).toFixed(2)); // Round to 2 decimal places
                    return child;
                });
            } else if (row.children) {
                row.children = distributeValue(row.children);
            }
            return row;
        });
    };

    if (dataHasChildren(updatedData, id)) {
        updatedData.rows = distributeValue(updatedData.rows);
    }
    return updatedData;
};

export const dataHasChildren = (data, id) => {
    let hasChildren = false;
    const checkChildren = (rows) => {
        for (const row of rows) {
            if (row.id === id && row.children && row.children.length > 0) {
                hasChildren = true;
                return;
            }
            if (row.children) {
                checkChildren(row.children);
            }
        }
    };

    checkChildren(data.rows);
    return hasChildren;
};

export const updateValue = (data, id, updateFunction) => {
    const update = (rows) => {
        return rows.map(row => {
            if (row.id === id) {
                row.value = updateFunction(row);
            } else if (row.children) {
                row.children = update(row.children);
            }
            return row;
        });
    };

    return { ...data, rows: update(data.rows) };
};

export const calculateVariance = (original, current) => {
    if (original === 0) {
        return current === 0 ? '0%' : 'Infinity%';
    }
    const variance = ((current - original) / original) * 100;
    return `${variance.toFixed(2)}%`;
};

export const calculateGrandTotal = (data) => {
    return data.rows.reduce((sum, row) => sum + row.value, 0);
  };