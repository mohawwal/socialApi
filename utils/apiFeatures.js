class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
        this.hasWhereClause = false;
    }

    search() {
        if (this.queryStr.keyword) {
            const keyword = this.queryStr.keyword;
            if (!this.hasWhereClause) {
                this.query += ` WHERE name LIKE '%${keyword}%'`;
                this.hasWhereClause = true;
            } else {
                this.query += ` AND name LIKE '%${keyword}%'`;
            }
        }
        return this;
    }
    
    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = (currentPage - 1) * resPerPage;

        // Append LIMIT and OFFSET to the query
        this.query += ` LIMIT ${resPerPage} OFFSET ${skip}`;
        return this;
    }

    filterByUserId() {
        // Check if userId is present in queryStr
        if (this.queryStr.userId) {
            // Add WHERE or AND based on whether a WHERE clause has already been added
            if (!this.hasWhereClause) {
                this.query += ` WHERE p.userId = ${this.queryStr.userId}`;
                this.hasWhereClause = true; // Mark that a WHERE clause has been added
            } else {
                this.query += ` AND p.userId = ${this.queryStr.userId}`;
            }
        }
        return this;
    }
}

module.exports = APIFeatures;
