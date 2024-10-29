import React from 'react';
import { Formik, Form } from 'formik';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { DatePicker } from 'antd';
import moment from 'moment';
import { Stack } from '@mui/material';

const FilterForm = ({
    open,
    onClose,
    onSubmit,
    filterableFields,
    items = []
}: any) => {
    const initialValues = {
        start_date: null,
        end_date: null,
    };

    const getUniqueItems = (key: any) => {
        const uniqueValues = new Set();
        return items
            .filter((item: any) => item[key] !== undefined)
            .filter((item: any) => {
                const isDuplicate = uniqueValues.has(item[key]);
                uniqueValues.add(item[key]);
                return !isDuplicate;
            });
    };

    const handleSubmit = (values: any) => {
        onSubmit(values);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose} modal={false}>
            <DialogContent className="px-4">
                <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                >
                    {({ values, setFieldValue }: any) => (
                        <Form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {filterableFields.map(({ key, label }: any) => (
                                    <div key={key} className="space-y-2">
                                        <Label>{label}</Label>
                                        <Select
                                            onValueChange={(value) => setFieldValue(key, value)}
                                            value={values[key]}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={`Select ${label}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getUniqueItems(key).map((item: any) => (
                                                    <SelectItem key={item[key]} value={item[key]}>
                                                        {item[key]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}

                                <Stack spacing={2} direction={'row'}>
                                    <div className="w-96">
                                        <Label>Start Date</Label>
                                        <DatePicker
                                            value={values.start_date ? moment(values.start_date) : null}
                                            onChange={(date) => setFieldValue('start_date', date ? date.toISOString() : null)}
                                            style={{ width: '100%' }}
                                        />
                                    </div>


                                </Stack>
                                <div className="w-46">
                                    <Label>End Date</Label>
                                    <DatePicker
                                        value={values.end_date ? moment(values.end_date) : null}
                                        onChange={(date) => setFieldValue('end_date', date ? date.toISOString() : null)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button className='bg-black' type="submit">
                                    Apply Filters
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};

export default FilterForm;
