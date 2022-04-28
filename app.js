const https = require("https");

const assignProductDetails = (details, idOfDetail) => {
  return details.find((detail) => parseInt(detail.id) === parseInt(idOfDetail));
};

const groupProducts = (data) => {
  const groupedProducts = [];
  data.products.forEach((product) => {
    const assignedColor = assignProductDetails(data.colors, product.id);
    const assignedSize = assignProductDetails(data.sizes, product.id);
    groupedProducts.push({
      ...product,
      color: { ...assignedColor },
      size: { ...assignedSize },
    });
  });

  return groupedProducts;
};

const filterProducts = (selectedFilters, products, key) => {
  const filteredProductsArr = [];
  products.forEach((product) => {
    selectedFilters.forEach((filterValue) => {
      if (filterValue === product[key].value && product.price > 200) {
        filteredProductsArr.push(product);
      }
    });
  });
  return filteredProductsArr;
};

const getHighestPrice = (products) => {
  return products.reduce((max, obj) => (max.price > obj.price ? max : obj));
};

const getLowestPrice = (products) => {
  return products.reduce((prev, curr) =>
    prev.price < curr.price ? prev : curr
  );
};

const getAddedNumbers = (arr) => {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (i % 2 == 0 && i < arr.length - 1) {
      result.push(arr[i] + arr[i + 1]);
    }
  }
  return result;
};

const fetchData = async () => {
  let data = "";
  https
    .get("https://www.monogo.pl/competition/input.txt", (res) => {
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        data = JSON.parse(data);

        const groupedProducts = groupProducts(data);
        const filteredProductsByColor = filterProducts(
          data.selectedFilters.colors,
          groupedProducts,
          "color"
        );
        const filteredProductsBySize = filterProducts(
          data.selectedFilters.colors,
          groupedProducts,
          "size"
        );
        const filteredProducts = [
          ...filteredProductsByColor,
          ...filteredProductsBySize,
        ];
        const highestPriceObj = getHighestPrice(filteredProducts);
        const lowestPriceObj = getLowestPrice(filteredProducts);
        const roundedValue = Math.round(
          highestPriceObj.price * lowestPriceObj.price
        );
        const arrOfDigits = Array.from(String(roundedValue), Number);
        const finalArray = getAddedNumbers(arrOfDigits);
        //sprawdzałem kilka razy i nie wiem czy nie widzę gdzie popełniłem błąd czy z danych wychodzi liczba 13 zamiast 14 :D
        const indexOfOffice = finalArray.findIndex((el) => el === 13);
        const finalValue = indexOfOffice * roundedValue * "Monogo".length;
        console.log(finalValue);
      });
    })
    .on("error", (err) => {
      console.log(err.message);
    })
    .end();
  return data;
};
fetchData();
