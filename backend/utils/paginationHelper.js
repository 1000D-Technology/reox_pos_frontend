
class PaginationHelper {
    /**
     * 
     * @param {number} page
     * @param {number} limit 
     * @param {number} totalCount
     * @returns {Object}
     */
    static getPaginationMetadata(page, limit, totalCount) {
        const totalPages = Math.ceil(totalCount / limit);
        
        return {
            currentPage: parseInt(page),
            totalPages: totalPages,
            totalRecords: totalCount,
            recordsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
    }

    static getSkip(page, limit) {
        return (parseInt(page) - 1) * parseInt(limit);
    }
}

module.exports = PaginationHelper;