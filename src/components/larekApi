import { Api, ApiListResponse } from './base/api';
import { IProductItem, IOrderResult, IOrder  } from "../types";

export interface ILarekAPI {
    getProductList: () => Promise<IProductItem[]>;
    getProductItem: (id: string) => Promise<IProductItem>;
    orderProducts: (order: IOrder) => Promise<IOrderResult>;
}

export class LarekAPI extends Api implements ILarekAPI {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    getProductList(): Promise<IProductItem[]> {
        return this.get('/product').then((data) =>
            (data as ApiListResponse<IProductItem>).items.map((item) => ({
                ...item,
                image: this.cdn + item.image
            }))
        );
    }

    getProductItem(id: string): Promise<IProductItem> {
        return this.get(`/product/${id}`).then(
            (item: any) => ({
                ...(item as IProductItem),
                image: this.cdn + item.image,
            })
        );
    }

    orderProducts(order: IOrder): Promise<IOrderResult> {
        return this.post('/order', order).then(
            (data: any) => data
        );
    }
}
