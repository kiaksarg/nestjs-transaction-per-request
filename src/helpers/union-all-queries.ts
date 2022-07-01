export const unionAllQueries = (
  query,
  countQuery,
  parameter,
  entities: any[],
  whereParametersCount,
) => {
  let allQueries = '';
  let allCountQueries = '';
  const parameters = [];

  const whereParameters = parameter.splice(whereParametersCount, parameter.length - 1);

  for (let index = 0; index < entities.length; index++) {
    const culture = entities[index];

    allQueries += index !== entities.length - 1 ? `(${query})` + ' UNION ALL ' : `(${query})`;
    allCountQueries +=
      index !== entities.length - 1 ? `(${countQuery})` + ' UNION ALL ' : `(${countQuery})`;

    parameters.push(...[culture.id, ...whereParameters]);
  }

  return { allQueries, allCountQueries, parameters };
};
