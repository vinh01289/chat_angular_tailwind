
export const Constant = {
    LOCALVARIABLENAME: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        smsOtpToken: 'smsOtpToken'
    }
};

export const HandleLocalStore = {
    writeaccessToken: (accessToken) => {
        localStorage.setItem(Constant.LOCALVARIABLENAME.accessToken, accessToken);
    },

    writerefreshToken: (refreshToken) => {
        localStorage.setItem(Constant.LOCALVARIABLENAME.refreshToken, refreshToken);
    },
    writesmsOtpToken: (smsOtpToken) => {
        localStorage.setItem(Constant.LOCALVARIABLENAME.smsOtpToken, smsOtpToken);
    },
    getToken(): string{
        return localStorage.getItem(Constant.LOCALVARIABLENAME.accessToken);
    }
};
