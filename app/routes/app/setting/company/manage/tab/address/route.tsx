import {
  getInputProps,
  useFormMetadata,
  useInputControl,
} from "@conform-to/react";
import { Text } from "@mantine/core";

import InputSelect from "~/components/form/input-select";
import InputText from "~/components/form/input-text";

import {
  CompanyBaseSchemaType,
  companyFormLabel,
} from "../../schema/company.schema";

const CompanyAddressTabPanel = () => {
  const companyFormMeta =
    useFormMetadata<CompanyBaseSchemaType>("company-form");
  const companyForm = companyFormMeta.getFieldset();
  const shippingAddressField = companyForm.shipping_address.getFieldset();
  const billingAddressField = companyForm.billing_address.getFieldset();

  const formLabel = companyFormLabel;

  const shippingCountry = useInputControl(shippingAddressField.country);
  const shippingProvince = useInputControl(shippingAddressField.province);
  const shippingCity = useInputControl(shippingAddressField.city);
  const shippingDistrict = useInputControl(shippingAddressField.district);
  const shippingSubdistrict = useInputControl(shippingAddressField.subdistrict);

  const billingCountry = useInputControl(billingAddressField.country);
  const billingProvince = useInputControl(billingAddressField.province);
  const billingCity = useInputControl(billingAddressField.city);
  const billingDistrict = useInputControl(billingAddressField.district);
  const billingSubdistrict = useInputControl(billingAddressField.subdistrict);

  const resetShippingAddressFields = (fields: string[]) => {
    if (fields) {
      fields.forEach((el) => {
        switch (el) {
          case "province":
            companyFormMeta.reset({
              name: shippingAddressField.province.name,
            });
            break;
          case "city":
            companyFormMeta.reset({
              name: shippingAddressField.city.name,
            });
            break;
          case "district":
            companyFormMeta.reset({
              name: shippingAddressField.district.name,
            });
            break;
          case "subdistrict":
            companyFormMeta.reset({
              name: shippingAddressField.subdistrict.name,
            });
            break;

          default:
            break;
        }
      });
    }
  };

  const resetBillingAddressFields = (fields: string[]) => {
    if (fields) {
      fields.forEach((el) => {
        switch (el) {
          case "province":
            companyFormMeta.reset({
              name: billingAddressField.province.name,
            });
            break;
          case "city":
            companyFormMeta.reset({
              name: billingAddressField.city.name,
            });
            break;
          case "district":
            companyFormMeta.reset({
              name: billingAddressField.district.name,
            });
            break;
          case "subdistrict":
            companyFormMeta.reset({
              name: billingAddressField.subdistrict.name,
            });
            break;

          default:
            break;
        }
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-2">
        <div className="p-5">
          <Text className="w-full border-b border-b-tm-gray py-2 font-semibold">
            Pengiriman
          </Text>
          <InputText
            fields={shippingAddressField}
            {...formLabel["shipping_address"]["attention"]}
            my="sm"
          />
          <InputText
            fields={shippingAddressField}
            {...formLabel["shipping_address"]["address"]}
            my="sm"
          />
          <input
            {...getInputProps(shippingAddressField.address_type, {
              type: "hidden",
            })}
            defaultValue="shipping"
          />
          <InputSelect
            {...formLabel["shipping_address"]["country"]}
            remountKey={shippingCountry.value}
            fields={shippingAddressField}
            searchable={true}
            value={shippingCountry.value}
            onFocus={shippingCountry.focus}
            onChange={(value) => {
              shippingCountry.change(value ?? undefined);
              resetShippingAddressFields([
                "province",
                "city",
                "district",
                "subdistrict",
              ]);
            }}
            selectFirstOptionOnChange={true}
            onBlur={() => {
              return shippingCountry.blur;
            }}
            dataFetch={{
              urlPath: "api/country",
              keys: { label: "name", value: "id" },
              dataKeys: "data",
            }}
            allowDeselect
            skipLimit={shippingCountry.value ? true : false}
          />
          <InputSelect
            {...formLabel["shipping_address"]["province"]}
            remountKey={shippingProvince.value}
            fields={shippingAddressField}
            searchable={true}
            value={shippingProvince.value}
            onChange={(value) => {
              shippingProvince.change(value ?? undefined);
              resetShippingAddressFields(["city", "district", "subdistrict"]);
            }}
            onFocus={shippingProvince.focus}
            selectFirstOptionOnChange={true}
            onBlur={() => {
              return shippingProvince.blur;
            }}
            dataFetch={{
              urlPath: "api/province",
              keys: { label: "name", value: "id" },
              dataKeys: "data",
              params: {
                f_country: shippingCountry.value || undefined,
              },
            }}
            allowDeselect
            skipLimit={shippingProvince.value ? true : false}
          />
          <InputSelect
            {...formLabel["shipping_address"]["city"]}
            remountKey={shippingCity.value}
            fields={shippingAddressField}
            searchable={true}
            onChange={(value) => {
              shippingCity.change(value ?? undefined);
              resetShippingAddressFields(["district", "subdistrict"]);
            }}
            value={shippingCity.value}
            onFocus={shippingCity.focus}
            selectFirstOptionOnChange={true}
            onBlur={() => {
              return shippingCity.blur;
            }}
            dataFetch={{
              urlPath: "api/city",
              keys: { label: "name", value: "id" },
              dataKeys: "data",
              params: {
                f_province: shippingProvince.value,
              },
            }}
            allowDeselect
            skipLimit={shippingCity.value ? true : false}
          />
          <InputSelect
            {...formLabel["shipping_address"]["district"]}
            remountKey={shippingDistrict.value}
            fields={shippingAddressField}
            searchable={true}
            value={shippingDistrict.value}
            onFocus={shippingDistrict.focus}
            onChange={(value) => {
              shippingDistrict.change(value ?? undefined);
              resetShippingAddressFields(["subdistrict"]);
            }}
            selectFirstOptionOnChange={true}
            onBlur={() => {
              return shippingDistrict.blur;
            }}
            dataFetch={{
              urlPath: "api/district",
              keys: { label: "name", value: "id" },
              dataKeys: "data",
              params: {
                f_city: shippingCity.value,
              },
            }}
            allowDeselect
            skipLimit={shippingDistrict.value ? true : false}
          />
          <InputSelect
            {...formLabel["shipping_address"]["subdistrict"]}
            remountKey={shippingSubdistrict.value}
            fields={shippingAddressField}
            searchable={true}
            onChange={(value) => {
              shippingSubdistrict.change(value ?? undefined);
            }}
            value={shippingSubdistrict.value}
            onFocus={shippingSubdistrict.focus}
            selectFirstOptionOnChange={true}
            onBlur={() => {
              return shippingSubdistrict.blur;
            }}
            dataFetch={{
              urlPath: "api/subdistrict",
              keys: { label: "name", value: "id" },
              dataKeys: "data",
              params: {
                f_district: shippingDistrict.value,
              },
            }}
            allowDeselect
            skipLimit={shippingSubdistrict.value ? true : false}
          />
        </div>
        <div className="p-5">
          <Text className="w-full border-b border-b-tm-gray py-2 font-semibold">
            Penagihan
          </Text>
          <InputText
            fields={billingAddressField}
            {...formLabel["billing_address"]["attention"]}
            my="sm"
          />
          <input
            {...getInputProps(billingAddressField.address_type, {
              type: "hidden",
            })}
            defaultValue="billing"
          />
          <InputText
            fields={billingAddressField}
            {...formLabel["billing_address"]["address"]}
            my="sm"
          />
          <InputSelect
            {...formLabel["billing_address"]["country"]}
            remountKey={billingCountry.value}
            fields={billingAddressField}
            searchable={true}
            value={billingCountry.value}
            onFocus={billingCountry.focus}
            onChange={(value) => {
              billingCountry.change(value ?? undefined);
              resetBillingAddressFields([
                "province",
                "city",
                "district",
                "subdistrict",
              ]);
            }}
            selectFirstOptionOnChange={true}
            onBlur={() => {
              return billingCountry.blur;
            }}
            dataFetch={{
              urlPath: "api/country",
              keys: { label: "name", value: "id" },
              dataKeys: "data",
            }}
            allowDeselect
            skipLimit={billingCountry.value ? true : false}
          />
          <InputSelect
            {...formLabel["billing_address"]["province"]}
            remountKey={billingProvince.value}
            fields={billingAddressField}
            searchable={true}
            value={billingProvince.value}
            onChange={(value) => {
              billingProvince.change(value ?? undefined);
              resetBillingAddressFields(["city", "district", "subdistrict"]);
            }}
            onFocus={billingProvince.focus}
            selectFirstOptionOnChange={true}
            onBlur={() => {
              return billingProvince.blur;
            }}
            dataFetch={{
              urlPath: "api/province",
              keys: { label: "name", value: "id" },
              dataKeys: "data",
              params: {
                f_country: billingCountry.value || undefined,
              },
            }}
            allowDeselect
            skipLimit={billingProvince.value ? true : false}
          />
          <InputSelect
            {...formLabel["billing_address"]["city"]}
            remountKey={billingCity.value}
            fields={billingAddressField}
            searchable={true}
            onChange={(value) => {
              billingCity.change(value ?? undefined);
              resetBillingAddressFields(["district", "subdistrict"]);
            }}
            value={billingCity.value}
            onFocus={billingCity.focus}
            selectFirstOptionOnChange={true}
            onBlur={() => {
              return billingCity.blur;
            }}
            dataFetch={{
              urlPath: "api/city",
              keys: { label: "name", value: "id" },
              dataKeys: "data",
              params: {
                f_province: billingProvince.value,
              },
            }}
            allowDeselect
            skipLimit={billingCity.value ? true : false}
          />
          <InputSelect
            {...formLabel["billing_address"]["district"]}
            remountKey={billingDistrict.value}
            fields={billingAddressField}
            searchable={true}
            onChange={(value) => {
              billingDistrict.change(value ?? undefined);
              resetBillingAddressFields(["subdistrict"]);
            }}
            value={billingDistrict.value}
            onFocus={billingDistrict.focus}
            selectFirstOptionOnChange={true}
            onBlur={() => {
              return billingDistrict.blur;
            }}
            dataFetch={{
              urlPath: "api/district",
              keys: { label: "name", value: "id" },
              dataKeys: "data",
              params: {
                f_city: billingCity.value,
              },
            }}
            allowDeselect
            skipLimit={billingDistrict.value ? true : false}
          />
          <InputSelect
            {...formLabel["billing_address"]["subdistrict"]}
            remountKey={billingSubdistrict.value}
            fields={billingAddressField}
            searchable={true}
            value={billingSubdistrict.value}
            onChange={(value) => {
              billingSubdistrict.change(value ?? undefined);
            }}
            onFocus={billingSubdistrict.focus}
            selectFirstOptionOnChange={true}
            onBlur={() => {
              return billingSubdistrict.blur;
            }}
            dataFetch={{
              urlPath: "api/subdistrict",
              keys: { label: "name", value: "id" },
              dataKeys: "data",
              params: {
                f_district: billingDistrict.value,
              },
            }}
            allowDeselect
            skipLimit={billingSubdistrict.value ? true : false}
          />
        </div>
      </div>
    </>
  );
};

export default CompanyAddressTabPanel;
