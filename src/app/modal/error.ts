export class ErrorLogin {
    code: string;
    data: object;
    details: string;
    message: string;
    validationErrors: Data[];
}
class Data{
    message: string;
    member: string;
}
